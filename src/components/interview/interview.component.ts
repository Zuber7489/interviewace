import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService } from '../../services/state.service';
import { GeminiService } from '../../services/gemini.service';
import { LiveAudioService } from '../../services/live-audio.service';

@Component({
  selector: 'app-interview',
  imports: [CommonModule, FormsModule],
  templateUrl: './interview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterviewComponent implements OnInit, OnDestroy {
  stateService = inject(StateService);
  geminiService = inject(GeminiService);
  liveAudioService = inject(LiveAudioService);
  router = inject(Router);

  session = this.stateService.activeSession;

  // Signals for real-time state
  isLoading = signal(true);
  isFinishing = signal(false);

  timeLeft = signal(0);
  timerId: any;

  // Aliases for template binding
  currentQuestionText = this.liveAudioService.currentQuestionText;
  userTranscript = this.liveAudioService.userTranscript;
  isAISpeaking = this.liveAudioService.isSpeaking;
  isMicOn = this.liveAudioService.isMicOn;

  constructor() {
    effect(() => {
      const session = this.session();
      if (session) {
        this.timeLeft.set(session.config.interviewDuration * 60);
      }
    });
  }

  async ngOnInit() {
    const currentSession = this.session();

    // Safety check: specific to preventing "Back" button re-entry
    if (currentSession?.endTime) {
      this.router.navigate(['/report'], { replaceUrl: true });
      return;
    }

    this.startTimer();
    if (currentSession) {
      await this.liveAudioService.startSession(currentSession.config);
      this.isLoading.set(false);
    } else {
      // Handle error case where session is null
      console.error("Interview session not found!");
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    clearInterval(this.timerId);
    this.liveAudioService.stopSession();
  }

  startTimer() {
    this.timerId = setInterval(() => {
      this.timeLeft.update(t => t > 0 ? t - 1 : 0);
      if (this.timeLeft() <= 0) {
        this.finishInterview();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  async finishInterview() {
    if (this.isFinishing()) return;
    this.isFinishing.set(true);

    try {
      clearInterval(this.timerId);

      // Stop the live session and get the history
      const history = this.liveAudioService.getChatHistory();
      console.log('Final Interview History:', history);
      await this.liveAudioService.stopSession();

      // Check if report generation is enabled
      const reportGenerationEnabled = this.stateService.enableReports();

      // Generate final report only if enabled
      if (this.session() && history.length > 0 && reportGenerationEnabled) {
        // Use the regular Gemini service for final evaluation
        const { overallFeedback, overallScore, evaluatedQuestions } = await this.geminiService.generateFinalFeedback(history);

        this.session.update(s => {
          if (!s) return null;
          s.endTime = Date.now();
          s.overallFeedback = overallFeedback;
          s.overallScore = overallScore;
          s.chatHistory = history.map(h => ({
            role: h.role as 'user' | 'model',
            parts: h.parts.map(p => ({ text: (p as any).text || '' }))
          }));
          s.evaluatedQuestions = evaluatedQuestions.map(q => ({ ...q, type: 'Live' }));
          return s;
        });
      } else if (this.session() && history.length > 0) {
        // Save chat history even without report generation
        this.session.update(s => {
          if (!s) return null;
          s.endTime = Date.now();
          s.chatHistory = history.map(h => ({
            role: h.role as 'user' | 'model',
            parts: h.parts.map(p => ({ text: (p as any).text || '' }))
          }));
          return s;
        });
      }

      this.stateService.finishInterview();
    } catch (e) {
      console.error("Error during interview finishing:", e);
      this.stateService.finishInterview();
    } finally {
      this.isFinishing.set(false);
      // Navigate to dashboard if report generation is disabled, otherwise go to report page
      const reportGenerationEnabled = this.stateService.enableReports();
      if (reportGenerationEnabled) {
        this.router.navigate(['/report'], { replaceUrl: true });
      } else {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    }
  }
}
