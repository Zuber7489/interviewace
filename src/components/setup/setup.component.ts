import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService } from '../../services/state.service';
import { AuthService } from '../../services/auth.service';
import { LiveAudioService } from '../../services/live-audio.service';
import { InterviewConfig, InterviewSession } from '../../models';

@Component({
  selector: 'app-setup',
  // FIX: Removed `standalone: true` as it is default in Angular v20+.
  imports: [CommonModule, FormsModule],
  templateUrl: './setup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupComponent implements OnInit {
  stateService = inject(StateService);
  authService = inject(AuthService);
  liveAudioService = inject(LiveAudioService);
  router = inject(Router);

  setupMethod = signal<'form' | 'resume'>('form');

  // Form signals
  primaryTechnology = signal('');
  secondarySkills = signal('');
  yearsOfExperience = signal(2);
  interviewDuration = signal(10);
  language = signal<'English' | 'Hindi' | 'Hinglish'>('English');

  // Resume signal
  resumeText = signal('');
  resumeFileName = signal<string | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);

  // Dashboard Data
  currentUser = this.authService.currentUser;
  history = this.stateService.history;
  enableReports = this.stateService.enableReports;

  ngOnInit() {
    // Hard reset all session and audio state when entering setup
    this.stateService.resetActiveSession();
    this.liveAudioService.resetSignals();
  }

  toggleReportGeneration() {
    this.stateService.toggleReportGeneration();
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.resumeFileName.set(file.name);

      // Basic text extraction based on file type
      if (file.type === 'text/plain') {
        const text = await file.text();
        this.resumeText.set(text);
      } else if (file.type === 'application/pdf') {
        try {
          this.isLoading.set(true);
          const text = await this.extractTextFromPDF(file);
          this.resumeText.set(text);
        } catch (e: any) {
          this.error.set("Failed to parse PDF: " + e.message);
          this.resumeFileName.set(null);
        } finally {
          this.isLoading.set(false);
        }
      } else {
        // FIX (19): Clear, actionable error for unsupported formats
        const ext = file.name.split('.').pop()?.toUpperCase() || 'this format';
        this.error.set(`❌ ${ext} files are not supported. Please upload a PDF or TXT file. (Tip: In Word/Google Docs, choose File → Save As → PDF)`);
        this.resumeFileName.set(null);
      }
    }
  }

  async extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    // Set worker source to jsDelivr CDN for reliability
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  }

  async startInterview() {
    this.error.set(null);

    // FIX (18): Validate that primaryTechnology is not empty
    const tech = this.primaryTechnology().trim();
    if (!tech) {
      this.error.set('Please enter the primary technology or role for your interview.');
      return;
    }

    // FIX (22): Pre-check microphone permission before entering the interview screen
    this.isLoading.set(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the test stream immediately — we just needed to verify access
      stream.getTracks().forEach(t => t.stop());
    } catch (micErr: any) {
      this.isLoading.set(false);
      const isDenied = micErr?.name === 'NotAllowedError' || micErr?.name === 'PermissionDeniedError';
      this.error.set(
        isDenied
          ? '🎤 Microphone access is blocked. Please allow microphone access in your browser settings (click the 🔒 icon in the address bar) and try again.'
          : '🎤 Could not access microphone. Please make sure a microphone is connected and try again.'
      );
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // SaaS Gating logic: Check limits dynamically for ALL users
    const maxLimits = user.maxInterviews ?? (user.subscription === 'pro' ? 10 : 2);
    if ((user.interviewsCount || 0) >= maxLimits && user.subscription !== 'enterprise') {
      this.error.set(`You've reached your limit of ${maxLimits} interviews. Buy a Pro Pack (₹200 for 10 interviews) to continue!`);
      this.isLoading.set(false);
      return;
    }

    const config: InterviewConfig = {
      primaryTechnology: this.primaryTechnology(),
      secondarySkills: this.secondarySkills(),
      yearsOfExperience: this.yearsOfExperience(),
      interviewDuration: this.interviewDuration(),
      language: this.language(),
      resumeText: this.setupMethod() === 'resume' ? this.resumeText() : undefined,
    };

    const session: InterviewSession = {
      id: crypto.randomUUID(),
      userId: user.id,
      date: new Date().toISOString(),
      config,
      chatHistory: [],
      evaluatedQuestions: [],
      startTime: Date.now(),
    };

    this.stateService.startInterview(session);
    this.router.navigate(['/interview']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}