
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

// Backend URL for token generation
const TOKEN_SERVER_URL = 'http://localhost:3001/api/token';

@Injectable({
  providedIn: 'root',
})
export class LiveAudioService {
  private ai!: GoogleGenAI;
  private session: any; // Gemini Live Session
  private inputAudioContext!: AudioContext;  // 16kHz for microphone input
  private outputAudioContext!: AudioContext; // 24kHz for playback
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

  constructor(private zone: NgZone) { }

  private async getEphemeralToken(): Promise<string> {
    try {
      const response = await fetch(TOKEN_SERVER_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Failed to get token from backend:', error);
      throw new Error('Authentication failed: Could not retrieve secure token from backend.');
    }
  }

  async startSession(config: InterviewConfig) {
    if (this.isConnected()) return;

    const token = await this.getEphemeralToken();
    this.ai = new GoogleGenAI({
      apiKey: token,
      httpOptions: { apiVersion: 'v1alpha' }
    });

    // Create separate audio contexts for input and output
    this.inputAudioContext = new AudioContext({ sampleRate: 16000 });
    this.outputAudioContext = new AudioContext({ sampleRate: 24000 });

    await this.setupMicrophone();
    await this.connectToGemini(config);

    this.isMicOn.set(true);
  }

  async stopSession() {
    if (!this.isConnected()) return;

    this.session?.close();
    this.microphoneStream?.getTracks().forEach(track => track.stop());
    this.processorNode?.disconnect();

    if (this.inputAudioContext?.state !== 'closed') {
      await this.inputAudioContext.close();
    }
    if (this.outputAudioContext?.state !== 'closed') {
      await this.outputAudioContext.close();
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
    await this.inputAudioContext.audioWorklet.addModule(workletUrl);
    URL.revokeObjectURL(workletUrl);

    const microphoneSource = this.inputAudioContext.createMediaStreamSource(this.microphoneStream);
    this.processorNode = new AudioWorkletNode(this.inputAudioContext, 'pcm-processor');
    microphoneSource.connect(this.processorNode);

    this.processorNode.port.onmessage = (event) => {
      if (!this.isConnected() || !this.session) return;
      const pcmData = event.data;
      const base64Data = toBase64(pcmData.buffer);
      try {
        // Send audio using the correct Live API format
        this.session.sendRealtimeInput({
          audio: {
            mimeType: "audio/pcm;rate=16000",
            data: base64Data,
          }
        });
      } catch (e) {
        // Silently ignore errors during connection closing
      }
    };
  }

  private async connectToGemini(interviewConfig: InterviewConfig) {
    const config = {
      responseModalities: [Modality.AUDIO],
      systemInstruction: this.createSystemInstruction(interviewConfig),
    };

    this.session = await this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: config,
      callbacks: {
        onopen: () => {
          this.zone.run(() => this.isConnected.set(true));
        },
        onmessage: (message: any) => this.handleGeminiMessage(message),
        onerror: (e: any) => {
          console.error('WebSocket error:', e);
        },
        onclose: (e: any) => {
          this.zone.run(() => this.stopSession());
        },
      },
    });

    // Trigger the model to start the interview by sending initial context
    try {
      this.session.sendClientContent({
        turns: "Hello, I'm ready for my interview. Please start by introducing yourself and asking me your first question.",
        turnComplete: true
      });
    } catch (e) {
      // Continue anyway - the mic is active and AI will respond to voice
    }
  }

  private handleGeminiMessage(message: any) {
    this.zone.run(() => {
      // 1. Handle User Transcript (server turn)
      if (message.serverContent?.userTurn?.parts) {
        const transcript = message.serverContent.userTurn.parts.map((p: any) => p.text).join('');
        if (transcript) {
          // Accumulate the transcript (assuming deltas) rather than replacing
          this.userTranscript.update(prev => prev + transcript);
        }
      }

      // 2. Handle Model Turn (AI Speaking)
      if (message.serverContent?.modelTurn?.parts) {
        // If the model is starting to speak, we should commit the accumulated USER transcript to history
        // We do this if we have a pending user transcript.
        const pendingUserText = this.userTranscript();

        if (pendingUserText && pendingUserText.trim().length > 0) {
          // Commit the user's transcript to the history
          this.chatHistory.update(h => [...h, { role: 'user', parts: [{ text: pendingUserText }] }]);

          // Clear the live transcript buffer so we don't commit it again for the same turn
          this.userTranscript.set('');
        }

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
          // Clean up the model text to remove markdown artifacts like **Bold**
          let cleanText = modelText.replace(/\*\*.*?\*\*/g, '').trim();

          this.chatHistory.update(h => {
            const updatedHistory = [...h];
            const last = updatedHistory[updatedHistory.length - 1];

            // Append to existing model turn or create new one
            if (last && last.role === 'model') {
              last.parts[0].text += cleanText;
              this.currentQuestionText.set(last.parts[0].text || '');
              return updatedHistory;
            } else {
              this.currentQuestionText.set(cleanText);
              return [...updatedHistory, { role: 'model', parts: [{ text: cleanText }] }];
            }
          });
        }

        if (audioChunks.length > 0) {
          this.playAudio(audioChunks);
        }
      }

      // 3. Handle Turn Complete (Model finished generation)
      if (message.serverContent?.turnComplete) {
        this.isSpeaking.set(false);
      }
    });
  }

  private nextStartTime = 0;

  private async playAudio(base64Chunks: string[]) {
    // Check and resume context if needed
    if (this.outputAudioContext.state === 'suspended') {
      await this.outputAudioContext.resume();
    }

    const currentTime = this.outputAudioContext.currentTime;

    // If we have fallen behind (gap in audio) or this is the start of a new phrase,
    // reset nextStartTime to a slightly future time (50ms jitter buffer).
    // This allows chunks to be scheduled smoothly without immediate underruns.
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.05;
    }

    this.isSpeaking.set(true);

    for (const chunk of base64Chunks) {
      if (!chunk) continue;

      const audioData = Uint8Array.from(atob(chunk), c => c.charCodeAt(0)).buffer;
      // The API returns raw 16-bit PCM at 24kHz. Browser needs it in Float32.
      const pcmData = new Int16Array(audioData);
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0; // Convert to [-1, 1] range
      }

      if (this.outputAudioContext.state === 'closed') {
        return;
      }

      const audioBuffer = this.outputAudioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.copyToChannel(float32Data, 0);

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);

      // Schedule the audio to play at the precise next available time slot
      source.start(this.nextStartTime);

      // Advance the time cursor by the duration of this chunk
      this.nextStartTime += audioBuffer.duration;
    }
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
9. CRITICAL: Do NOT output any markdown formatting (like **bold**). Do NOT output internal thought processes or headers (e.g. "Assess Input", "Formulating Response"). Your text output must MATCH EXACTLY what you are speaking. Speak directly to the candidate as a human interviewer.`;
  }
}
