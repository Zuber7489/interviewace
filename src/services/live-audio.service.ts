
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

// Backend URL for token generation
// const TOKEN_SERVER_URL = 'http://localhost:3001/api/token';

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
  interimTranscript: WritableSignal<string> = signal('');
  chatHistory: WritableSignal<Content[]> = signal([]);

  private readonly CHAT_HISTORY_KEY = 'interviewace_chat_history';
  private sessionId: string = '';

  getChatHistory(): Content[] {
    const history = this.chatHistory();
    const pending = this.userTranscript();
    const interim = this.interimTranscript();
    const total = (pending + ' ' + interim).trim();

    if (total.length > 0) {
      return [...history, { role: 'user', parts: [{ text: total }] }];
    }
    return history;
  }

  resetSignals() {
    this.zone.run(() => {
      this.currentQuestionText.set('');
      this.userTranscript.set('');
      this.interimTranscript.set('');
      this.chatHistory.set([]);
      this.nextStartTime = 0;
      this.clearChatHistoryStorage();
    });
  }

  private saveChatHistoryToStorage(history: Content[]) {
    try {
      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save chat history to localStorage:', e);
    }
  }

  private loadChatHistoryFromStorage(): Content[] {
    try {
      const data = localStorage.getItem(this.CHAT_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load chat history from localStorage:', e);
      return [];
    }
  }

  clearChatHistoryStorage() {
    try {
      localStorage.removeItem(this.CHAT_HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear chat history from localStorage:', e);
    }
  }

  constructor(private zone: NgZone) { }

  private async getEphemeralToken(): Promise<string> {
    try {
      const response = await fetch(`${environment.backendUrl}/api/token`);
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

  private currentSessionId = 0;

  async startSession(config: InterviewConfig) {
    // Force cleanup of any lingering state first
    if (this.isConnected()) {
      await this.stopSession();
    }

    this.currentSessionId++;
    const sessionId = this.currentSessionId;
    this.sessionId = `session_${Date.now()}`;

    // --- FRESH START HARD RESET ---
    console.log('🔄 LiveAudioService: Hard resetting all internal state for a fresh session.');
    this.nextStartTime = 0; // Reset scheduling timer
    this.audioQueue = [];
    this.isPlaying = false;

    // Clear display signals immediately
    this.zone.run(() => {
      this.currentQuestionText.set('');
      this.userTranscript.set('');
      this.interimTranscript.set('');
      this.chatHistory.set([]);
    });

    // Clear stale history from storage to prevent leakage
    this.clearChatHistoryStorage();
    // ----------------------------

    const token = await this.getEphemeralToken();
    this.ai = new GoogleGenAI({
      apiKey: token,
      httpOptions: { apiVersion: 'v1alpha' }
    });

    // Create separate audio contexts for input and output
    this.inputAudioContext = new AudioContext();
    this.outputAudioContext = new AudioContext();

    // CRITICAL: Resume context immediately to avoid silent start on some browsers
    if (this.outputAudioContext.state === 'suspended') {
      await this.outputAudioContext.resume();
    }

    await this.setupMicrophone(sessionId);
    await this.connectToGemini(config, sessionId);

    this.isMicOn.set(true);
  }

  async stopSession() {
    // 1. Mark as disconnected immediately
    this.isConnected.set(false);
    this.isMicOn.set(false);
    this.isSpeaking.set(false);
    this.isPlaying = false;
    this.audioQueue = [];
    this.nextStartTime = 0; // Reset scheduling timer 

    // 2. Capture and detach resources synchronously to prevent race conditions
    const sessionToClose = this.session;
    const inputCtx = this.inputAudioContext;
    const outputCtx = this.outputAudioContext;
    const stream = this.microphoneStream;
    const processor = this.processorNode;

    // Detach references so new session doesn't get clobbered
    this.session = undefined;
    this.processorNode = undefined;
    this.microphoneStream = undefined as any;
    // We don't set contexts to undefined as TS types expect them, 
    // but startSession will overwrite them safely now that we have local refs.

    // 3. Perform cleanup
    try {
      sessionToClose?.close();
    } catch (e) { console.warn('Error closing session:', e); }

    try {
      stream?.getTracks().forEach(track => track.stop());
    } catch (e) { console.warn('Error stopping tracks:', e); }

    try {
      processor?.disconnect();
    } catch (e) { console.warn('Error disconnecting processor:', e); }

    // Close contexts in background but ensure they are cleaned up
    if (inputCtx && inputCtx.state !== 'closed') {
      inputCtx.close().catch(() => { });
    }
    if (outputCtx && outputCtx.state !== 'closed') {
      outputCtx.close().catch(() => { });
    }

    try {
      this.speechRecognition?.stop();
    } catch (e) { }

    // Final purge of all signals to ensure clean state for next session
    this.resetSignals();
  }

  private speechRecognition: any;

  private async setupMicrophone(sessionId: number) {
    // Mobile-friendly microphone constraints
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1
      }
    };

    try {
      this.microphoneStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🎤 Microphone access granted, sample rate:', this.inputAudioContext.sampleRate);
      console.log('🎤 Audio tracks:', this.microphoneStream.getAudioTracks().length);
    } catch (error) {
      console.error('❌ Failed to get microphone access:', error);
      throw new Error('Microphone access denied or not available');
    }

    // Note: We rely on Live API's input_audio_transcription for user transcription
    // Web Speech API is not used for recording to avoid reliability issues


    try {
      const workletUrl = this.createWorklet();
      console.log('🎵 Loading AudioWorklet...');
      await this.inputAudioContext.audioWorklet.addModule(workletUrl);
      console.log('🎵 AudioWorklet loaded successfully');
      URL.revokeObjectURL(workletUrl);
    } catch (e) {
      console.error('❌ Failed to load AudioWorklet:', e);
      throw new Error('AudioWorklet loading failed');
    }

    if (this.currentSessionId !== sessionId) return;

    try {
      const microphoneSource = this.inputAudioContext.createMediaStreamSource(this.microphoneStream);
      this.processorNode = new AudioWorkletNode(this.inputAudioContext, 'pcm-processor');
      microphoneSource.connect(this.processorNode);
      console.log('🎵 Audio pipeline connected: microphone → processor');

      this.processorNode.port.onmessage = (event) => {
        if (!this.isConnected() || !this.session || this.currentSessionId !== sessionId) return;

        const pcmData = event.data;
        const base64Data = toBase64(pcmData.buffer);
        const sampleRate = this.inputAudioContext.sampleRate;
        try {
          this.session.sendRealtimeInput({
            audio: {
              mimeType: `audio/pcm;rate=${sampleRate}`,
              data: base64Data,
            }
          });
          // Log occasionally to avoid spam
          if (Math.random() < 0.01) {
            console.log('🎵 Sending audio chunk:', pcmData.length, 'samples at', sampleRate, 'Hz');
          }
        } catch (e) {
          console.error('❌ Error sending audio to Live API:', e);
        }
      };
      console.log('🎵 Audio processor ready, sending to Live API');
    } catch (e) {
      console.error('❌ Failed to setup audio pipeline:', e);
      throw new Error('Audio pipeline setup failed');
    }
  }

  private async connectToGemini(interviewConfig: InterviewConfig, sessionId: number) {
    const config = {
      responseModalities: [Modality.AUDIO],
      systemInstruction: this.createSystemInstruction(interviewConfig),
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    };

    this.session = await this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: config,
      callbacks: {
        onopen: () => {
          if (this.currentSessionId === sessionId) {
            this.zone.run(() => this.isConnected.set(true));
          }
        },
        onmessage: (message: any) => {
          if (this.currentSessionId === sessionId) {
            this.handleGeminiMessage(message);
          }
        },
        onerror: (e: any) => {
          console.error('WebSocket error:', e);
        },
        onclose: (e: any) => {
          if (this.currentSessionId === sessionId) {
            this.zone.run(() => this.stopSession());
          }
        },
      },
    });

    if (this.currentSessionId !== sessionId) {
      this.session.close();
      return;
    }

    try {
      this.session.sendClientContent({
        turns: "Hello, I'm ready for my interview. Please start by introducing yourself and asking me your first question.",
        turnComplete: true
      });
    } catch (e) {
    }
  }

  private handleGeminiMessage(message: any) {
    this.zone.run(() => {
      // Debug: Log message structure
      console.log('📨 Received message from Live API:', JSON.stringify(message, null, 2));

      // 1. Handle User Transcription from Live API
      if (message.serverContent?.inputTranscription?.text) {
        const userText = message.serverContent.inputTranscription.text.trim();
        if (userText && userText.length > 0) {
          console.log('💾 Saving User Answer (Live API Transcription):', userText);
          // Update userTranscript for display in UI
          this.userTranscript.update(prev => prev + ' ' + userText);
          // Don't save word-by-word to chat history - accumulate instead
          // The complete answer will be saved when the user finishes speaking (turnComplete)
        }
      }

      // Save complete user answer when turn is complete
      if (message.serverContent?.turnComplete) {
        const totalUserText = this.userTranscript().trim();
        if (totalUserText.length > 0) {
          console.log('💾 Saving complete user answer:', totalUserText);
          // Save to chat history
          const newHistory = [...this.chatHistory(), { role: 'user', parts: [{ text: totalUserText }] }];
          this.chatHistory.set(newHistory);
          this.saveChatHistoryToStorage(newHistory);
          // Clear userTranscript after saving
          this.userTranscript.set('');
        }
      }

      // 2. Handle Model Turn (AI Speaking)
      if (message.serverContent?.modelTurn?.parts) {

        // --- HANDLE AI SPEECH ---
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
          let cleanText = modelText.replace(/\*\*.*?\*\*/g, '').trim();
          // Filter leaked thought updates
          if (cleanText.startsWith('I process') || cleanText.startsWith('Assess Input')) {
            cleanText = '';
          }
          if (cleanText) {
            const currentHistory = this.chatHistory();
            const lastMsg = currentHistory[currentHistory.length - 1];
            let newHistory;

            // Append to existing model message if it exists, otherwise create new
            if (lastMsg && lastMsg.role === 'model') {
              // IMMUTABLE UPDATE
              const newParts = [...lastMsg.parts];
              newParts[0] = { ...newParts[0], text: (newParts[0].text || '') + cleanText };
              newHistory = [...currentHistory];
              newHistory[currentHistory.length - 1] = { ...lastMsg, parts: newParts };
              this.currentQuestionText.set(newParts[0].text);
            } else {
              this.currentQuestionText.set(cleanText);
              newHistory = [...currentHistory, { role: 'model', parts: [{ text: cleanText }] }];
            }

            this.chatHistory.set(newHistory);
            this.saveChatHistoryToStorage(newHistory);
          }
        }

        if (audioChunks.length > 0) {
          this.playAudio(audioChunks);
        }
      }

      // 3. Handle Turn Complete event (End of AI response)
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

    return `You are Sophia, an expert AI interviewer conducting a technical interview for a ${config.primaryTechnology} role.
Your goal is to conduct a ${config.interviewDuration}-minute interview.
The candidate profile is ${context}.

Follow these rules strictly:
1. Start the interview by introducing yourself as Sophia briefly and asking the first question.
2. Ask only one question at a time. Your response should contain both the audio of you speaking and the text of your question.
3. Wait for the user to respond with their voice. You will receive a transcript of their answer.
4. After they finish, provide brief, audible feedback. Then, immediately ask the next audible question.
5. Vary question types: Conceptual, Scenario-based, Behavioral, Architecture.
6. Adapt the difficulty based on the candidate's answers and experience level.
7. Keep the conversation flowing naturally. Do not end the interview yourself.
8. The interview MUST be conducted in ${config.language}. If the language is 'Hinglish', use a mix of Hindi and English.
9. CRITICAL: Do NOT output any markdown formatting (like **bold**). Do NOT output internal thought processes, planning text, or headers (e.g. "Assess Input", "Formulating Response", "I am now"). Your text output must MATCH EXACTLY what you are speaking. Speak directly to the candidate as a human interviewer. If you think about what to say, do NOT write it down. Only write what you speak.`;
  }
}
