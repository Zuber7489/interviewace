
import { Injectable, NgZone, signal, WritableSignal } from '@angular/core';
import { GoogleGenAI, Modality, Content } from '@google/genai';
import { InterviewConfig } from '../models';
import { environment } from '../environments/environment';

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

  constructor(private zone: NgZone) {
    console.log('✅ LiveAudioService initialized');
  }

  private async getEphemeralToken(): Promise<string> {
    console.log('🔑 Fetching ephemeral token from backend...');

    try {
      const response = await fetch(TOKEN_SERVER_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('✅ Ephemeral token received');
      return data.token;
    } catch (error) {
      console.error('❌ Failed to get ephemeral token:', error);
      // Fallback to direct API key (for development/testing)
      console.warn('⚠️ Falling back to direct API key (not recommended for production)');
      return environment.API_KEY;
    }
  }

  async startSession(config: InterviewConfig) {
    console.log('🎤 Starting session...');
    if (this.isConnected()) {
      console.log('⚠️ Already connected, returning');
      return;
    }

    // Get ephemeral token or fall back to API key
    const token = await this.getEphemeralToken();
    this.ai = new GoogleGenAI({ apiKey: token });

    // Create separate audio contexts for input and output
    this.inputAudioContext = new AudioContext({ sampleRate: 16000 });
    this.outputAudioContext = new AudioContext({ sampleRate: 24000 });
    console.log('✅ Audio contexts created - Input: 16kHz, Output: 24kHz');

    await this.setupMicrophone();
    await this.connectToGemini(config);

    this.isMicOn.set(true);
    console.log('✅ Session started, mic is on');
  }

  async stopSession() {
    console.log('🛑 Stopping session...');
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
    console.log('✅ Session stopped');
  }

  private async setupMicrophone() {
    console.log('🎙️ Setting up microphone...');
    this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('✅ Microphone access granted');

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
        // Silently ignore if connection is closing
        if (!String(e).includes('CLOSING')) {
          console.error('❌ Error sending audio:', e);
        }
      }
    };
    console.log('✅ Microphone setup complete');
  }

  private async connectToGemini(interviewConfig: InterviewConfig) {
    console.log('🔌 Connecting to Gemini...');
    const config = {
      responseModalities: [Modality.AUDIO],
      systemInstruction: this.createSystemInstruction(interviewConfig),
    };

    this.session = await this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: config,
      callbacks: {
        onopen: () => {
          console.log('✅ WebSocket connection opened');
          this.zone.run(() => this.isConnected.set(true));
        },
        onmessage: (message: any) => this.handleGeminiMessage(message),
        onerror: (e: any) => {
          console.error('❌ WebSocket error:', e);
          console.error('❌ Error details:', JSON.stringify(e));
        },
        onclose: (e: any) => {
          console.log('🔌 WebSocket closed:', e);
          console.log('🔌 Close reason:', e?.reason || 'No reason provided');
          console.log('🔌 Close code:', e?.code || 'No code');
          this.zone.run(() => this.stopSession());
        },
      },
    });

    console.log('✅ Connected to Gemini, triggering AI to start...');

    // Trigger the model to start the interview by sending initial context
    // Using simple string format as per SDK examples
    try {
      // Send a simple text turn to trigger the AI to respond
      this.session.sendClientContent({
        turns: "Hello, I'm ready for my interview. Please start by introducing yourself and asking me your first question.",
        turnComplete: true
      });
      console.log('✅ Initial context sent');
    } catch (e) {
      console.error('❌ Error sending initial context:', e);
      // Continue anyway - the mic is active and AI will respond to voice
    }
  }

  private handleGeminiMessage(message: any) {
    console.log('📨 Received message:', JSON.stringify(message).substring(0, 500));

    this.zone.run(() => {
      // Handle user transcript (server turn)
      if (message.serverContent?.userTurn?.parts) {
        const transcript = message.serverContent.userTurn.parts.map((p: any) => p.text).join('');
        if (transcript) {
          console.log('🗣️ User transcript:', transcript);
          this.userTranscript.set(transcript);
        }
      }

      // Handle interruption
      if (message.serverContent?.interrupted) {
        console.log('⚠️ Model was interrupted');
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

        console.log(`🤖 Model text: "${modelText.substring(0, 100)}..." | Audio chunks: ${audioChunks.length}`);

        if (modelText) {
          this.chatHistory.update(h => {
            const last = h[h.length - 1];
            if (last && last.role === 'model') {
              last.parts[0].text += modelText;
              this.currentQuestionText.set(last.parts[0].text || '');
              return [...h];
            } else {
              this.currentQuestionText.set(modelText);
              return [...h, { role: 'model', parts: [{ text: modelText }] }];
            }
          });
        }

        if (audioChunks.length > 0) {
          console.log(`🎵 Playing ${audioChunks.length} audio chunks`);
          this.playAudio(audioChunks);
        } else {
          console.log('⚠️ No audio chunks in this message');
        }
      }

      if (message.serverContent?.turnComplete) {
        console.log('✅ Turn complete');
        this.isSpeaking.set(false);
      }
    });
  }

  private async playAudio(base64Chunks: string[]) {
    console.log(`🔊 playAudio called with ${base64Chunks.length} chunks`);

    // Check and resume context if needed
    if (this.outputAudioContext.state === 'suspended') {
      console.log('⏸️ Output context was suspended, resuming...');
      await this.outputAudioContext.resume();
    }

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
        console.log('❌ Output context is closed, cannot play audio');
        return;
      }

      const audioBuffer = this.outputAudioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.copyToChannel(float32Data, 0);
      this.audioQueue.push(audioBuffer);
      console.log(`📥 Queued audio buffer, queue size: ${this.audioQueue.length}`);
    }

    if (!this.isPlaying) {
      console.log('▶️ Starting playback queue');
      this.playQueue();
    }
  }

  private playQueue() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.isSpeaking.set(false);
      console.log('⏹️ Playback queue empty, stopping');
      return;
    }
    this.isPlaying = true;
    this.isSpeaking.set(true);

    const buffer = this.audioQueue.shift()!;
    if (this.outputAudioContext.state === 'closed') {
      console.log('❌ Output context closed during playback');
      return;
    }

    const source = this.outputAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputAudioContext.destination);
    source.onended = () => this.playQueue();
    source.start();
    console.log(`🔈 Playing buffer, remaining in queue: ${this.audioQueue.length}`);
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
