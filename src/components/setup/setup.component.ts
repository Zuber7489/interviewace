import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService } from '../../services/state.service';
import { AuthService } from '../../services/auth.service';
import { InterviewConfig, InterviewSession } from '../../models';

@Component({
  selector: 'app-setup',
  // FIX: Removed `standalone: true` as it is default in Angular v20+.
  imports: [CommonModule, FormsModule],
  templateUrl: './setup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupComponent {
  stateService = inject(StateService);
  authService = inject(AuthService);
  router = inject(Router);

  setupMethod = signal<'form' | 'resume'>('form');

  // Form signals
  primaryTechnology = signal('');
  secondarySkills = signal('e.g. JavaScript, Python, React, System Design');
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
        // For now, simpler fallback for other types or DOCX (needs mammoth.js or similar)
        // We will just try reading as text for now if not PDF, or show error
        this.error.set("Only .txt and .pdf are currently supported for parsing. Please convert your resume to PDF.");
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

  startInterview() {
    this.isLoading.set(true);
    this.error.set(null);

    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
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