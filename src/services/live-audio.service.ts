
import { Injectable, NgZone, signal, WritableSignal } from '@angular/core';
import { GoogleGenAI, Modality, Content } from '@google/genai';
import { InterviewConfig } from '../models';

// Base64 encoding utility
function toBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LiveAudioService {
  private ai!: GoogleGenAI;
  private session: any; // Gemini Live Session
  private audioContext!: AudioContext;
  private microphoneStream!: MediaStream;
  private processorNode!: AudioWorkletNode;

  // Audio playback queue
  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;

  // Public state signals
  isConnected = signal(false);
  isMicOn = signal(false);
  isSpeaking = signal(false);
  currentQuestionText: WritableSignal<string> = signal('');
  userTranscript: WritableSignal<string> = signal('');
  chatHistory: WritableSignal<Content[]> = signal([]);

  constructor(private zone: NgZone) {
    if (!environment.API_KEY) {
      console.error('API_KEY not set');
      return;
    }
    this.ai = new GoogleGenAI({ apiKey: environment.API_KEY });
  }

  async startSession(config: InterviewConfig) {
    if (this.isConnected()) return;

    this.audioContext = new AudioContext({ sampleRate: 16000 });

    await this.setupMicrophone();
    await this.connectToGemini(config);

    this.isMicOn.set(true);
  }

  async stopSession() {
    if (!this.isConnected()) return;

    this.session?.close();
    this.microphoneStream?.getTracks().forEach(track => track.stop());
    this.processorNode?.disconnect();
    if (this.audioContext.state !== 'closed') {
      await this.audioContext.close();
    }

    this.isConnected.set(false);
    this.isMicOn.set(false);
    this.isSpeaking.set(false);
    this.audioQueue = [];
    this.isPlaying = false;
  }

  private async setupMicrophone() {
    this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const workletUrl = this.createWorklet();
    await this.audioContext.audioWorklet.addModule(workletUrl);
    URL.revokeObjectURL(workletUrl);

    const microphoneSource = this.audioContext.createMediaStreamSource(this.microphoneStream);
    this.processorNode = new AudioWorkletNode(this.audioContext, 'pcm-processor');
    microphoneSource.connect(this.processorNode);

    this.processorNode.port.onmessage = (event) => {
      const pcmData = event.data;
      const base64Data = toBase64(pcmData.buffer);
      this.session?.sendRealtimeInput({
        audio: { data: base64Data, mimeType: "audio/pcm;rate=16000" }
      });
    };
  }

  private async connectToGemini(interviewConfig: InterviewConfig) {
    const config = {
      responseModalities: [Modality.AUDIO],
      systemInstruction: this.createSystemInstruction(interviewConfig),
    };

    // FIX: Removed invalid 'transport' property. It must be configured in the GoogleGenAI constructor for live connections.
    this.session = await this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: config,
      callbacks: {
        onopen: () => this.zone.run(() => this.isConnected.set(true)),
        onmessage: (message: any) => this.handleGeminiMessage(message),
        onerror: (e: any) => console.error('Error:', e.message),
        onclose: (e: any) => this.zone.run(() => this.stopSession()),
      },
    });
  }

  private handleGeminiMessage(message: any) {
    this.zone.run(() => {
      // Handle user transcript (server turn)
      if (message.serverContent?.userTurn?.parts) {
        // The live API might send full transcripts or partial updates. 
        // Typically userTurn contains what the server heard so far or the final result.
        // We'll append/update based on observation.
        const transcript = message.serverContent.userTurn.parts.map((p: any) => p.text).join('');
        if (transcript) {
          // For now, we set it directly as it usually reflects "what has been heard so far" for the current turn.
          // If we want to be safe, we can check if it's a correction or append.
          this.userTranscript.set(transcript);
        }
      }

      // Also check for toolInput/toolResponse if applicable, but for audio modality:
      // Real-time user audio transcription often comes in `serverContent.turnComplete` or partials.
      // However, seeing the logs, sometimes transcript is in `modelTurn` if the model echoes? 
      // Actually strictly speaking, user audio transcript is sent back in `serverContent.modelTurn` only if we asked for it?
      // No, usually `serverContent.turnComplete` has the final user query.

      // Let's also look for `interrupted` status which might clear transcript.

      // Handle interruption
      if (message.serverContent?.interrupted) {
        // If model was interrupted, we might want to clear its last unfinished thought or just proceed.
        // For user transcript, since they just spoke to interrupt, we keep it.
      }

      if (message.serverContent?.modelTurn?.parts) {
        let modelText = '';
        const audioChunks: string[] = [];
        for (const part of message.serverContent.modelTurn.parts) {
          if (part.text) {
            modelText += part.text;
          }
          if (part.inlineData?.data) {
            audioChunks.push(part.inlineData.data);
          }
        }

        if (modelText) {
          // Check if this is a new turn to clear the user transcript from the PREVIOUS response?
          // Actually, we want the user transcript to stay until the USER speaks again.
          // But we have logic that appends to history.

          this.chatHistory.update(h => {
            const last = h[h.length - 1];
            if (last && last.role === 'model') {
              last.parts[0].text += modelText;
              this.currentQuestionText.set(last.parts[0].text || '');
              return [...h];
            } else {
              // New model turn started
              this.currentQuestionText.set(modelText);
              return [...h, { role: 'model', parts: [{ text: modelText }] }];
            }
          });

          // If it's a new turn, we generally don't clear the user's last speech immediately
          // so they can read what they just said.
        }
        if (audioChunks.length > 0) {
          this.playAudio(audioChunks);
        }
      }

      if (message.serverContent?.turnComplete) {
        this.isSpeaking.set(false);
        // If turn complete was user, we might want to finalize their transcript display if needed.
      }
    });
  }

  private async playAudio(base64Chunks: string[]) {
    for (const chunk of base64Chunks) {
      const audioData = Uint8Array.from(atob(chunk), c => c.charCodeAt(0)).buffer;
      // The API returns raw 16-bit PCM at 24kHz. Browser needs it in Float32.
      const pcmData = new Int16Array(audioData);
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0; // Convert to [-1, 1] range
      }

      if (this.audioContext.state === 'closed') return;
      const audioBuffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.copyToChannel(float32Data, 0);
      this.audioQueue.push(audioBuffer);
    }
    if (!this.isPlaying) {
      this.playQueue();
    }
  }

  private playQueue() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.isSpeaking.set(false);
      return;
    }
    this.isPlaying = true;
    this.isSpeaking.set(true);

    const buffer = this.audioQueue.shift()!;
    if (this.audioContext.state === 'closed') return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.onended = () => this.playQueue();
    source.start();
  }

  private createWorklet(): string {
    const processorString = `
      class PcmProcessor extends AudioWorkletProcessor {
        constructor() {
          super();
          this.bufferSize = 2048;
          this.buffer = new Int16Array(this.bufferSize);
          this.bufferIndex = 0;
        }

        process(inputs, outputs, parameters) {
          const input = inputs[0];
          if (input.length === 0) {
            return true;
          }
          
          const inputData = input[0]; // Mono channel
          
          for (let i = 0; i < inputData.length; i++) {
            // Convert to 16-bit PCM
            this.buffer[this.bufferIndex++] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
            
            if (this.bufferIndex === this.bufferSize) {
              this.port.postMessage(this.buffer);
              this.bufferIndex = 0;
            }
          }
          return true;
        }
      }
      registerProcessor('pcm-processor', PcmProcessor);
    `;
    const blob = new Blob([processorString], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  }

  private createSystemInstruction(config: InterviewConfig): string {
    const context = config.resumeText
      ? `based on the following resume: \n\n${config.resumeText}`
      : `for a candidate with ${config.yearsOfExperience} years of experience in ${config.primaryTechnology} and skills in ${config.secondarySkills}.`;

    return `You are an expert AI interviewer conducting a technical interview for a ${config.primaryTechnology} role.
Your goal is to conduct a ${config.interviewDuration}-minute interview.
The candidate profile is ${context}.

Follow these rules strictly:
1. Start the interview by introducing yourself briefly and asking the first question.
2. Ask only one question at a time. Your response should contain both the audio of you speaking and the text of your question.
3. Wait for the user to respond with their voice. You will receive a transcript of their answer.
4. After they finish, provide brief, audible feedback. Then, immediately ask the next audible question.
5. Vary question types: Conceptual, Scenario-based, Behavioral, Architecture.
6. Adapt the difficulty based on the candidate's answers and experience level.
7. Keep the conversation flowing naturally. Do not end the interview yourself.
8. The interview MUST be conducted in ${config.language}. If the language is 'Hinglish', use a mix of Hindi and English.
9. Do NOT output internal thought processes, headers like **Assessing Input**, or meta-commentary. Speak directly to the candidate as a human would.`;
  }
}
