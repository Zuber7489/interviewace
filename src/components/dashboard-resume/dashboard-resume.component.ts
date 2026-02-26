import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ref as dbRef, getDatabase, update } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebase.config';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

@Component({
  selector: 'app-dashboard-resume',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-2 sm:px-4">
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-4 sm:mb-6 md:mb-8">Upload Resume</h1>
      
      <div class="glass-card p-3 sm:p-4 md:p-6 lg:p-8 rounded-2xl border border-black/5">
        <div class="mb-4 sm:mb-6 md:mb-8">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4">Upload PDF Resume</h2>
            @if(uploading()) {
                <div class="text-blue-600 mb-2 font-medium">Uploading {{ uploadProgress() }}%</div>
            }
          <label
            class="group block w-full h-40 sm:h-48 md:h-64 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-black/50 hover:bg-black/5 transition-all duration-300">
            <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform">
              <i class="fas fa-cloud-upload-alt text-lg sm:text-xl md:text-2xl text-black"></i>
            </div>
            <span class="text-xs sm:text-sm md:text-lg font-medium text-gray-600 group-hover:text-black transition-colors">
              Drag & drop your resume here
            </span>
            <span class="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-1 sm:mt-2">or click to browse</span>
            <span class="text-[8px] sm:text-[10px] md:text-xs text-gray-400 mt-2 sm:mt-3 md:mt-4">Maximum size: 5MB</span>
            <input type="file" class="hidden" accept=".pdf" (change)="onFileSelected($event)">
          </label>
        </div>

        @if(resumeFileName()) {
        <div class="flex items-center justify-between bg-black/10 border border-black/20 p-2 sm:p-3 md:p-4 rounded-xl mb-4 sm:mb-6 md:mb-8">
          <div class="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
            <i class="fas fa-file-pdf text-lg sm:text-xl md:text-2xl text-black flex-shrink-0"></i>
            <div class="min-w-0">
              <p class="text-[10px] sm:text-xs md:text-sm font-medium text-black truncate">{{ resumeFileName() }}</p>
              <p class="text-[8px] sm:text-[10px] md:text-xs text-gray-600">{{ fileSize() }}</p>
            </div>
          </div>
          <button (click)="removeFile()" class="text-red-600 hover:text-red-800 transition-colors flex-shrink-0">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        }

        <div class="border-t border-black/10 pt-4 sm:pt-6 md:pt-8">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4 md:mb-6">Or Enter Details Manually</h2>
          
          <form (submit)="onSubmit($event)" class="space-y-3 sm:space-y-4 md:space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input type="text" [(ngModel)]="name" name="name" required
                class="w-full glass-card border border-black/10 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-all placeholder-gray-400"
                placeholder="John Doe">
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" required
                class="w-full glass-card border border-black/10 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-all placeholder-gray-400"
                placeholder="you@example.com">
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Experience Level (Years)</label>
              <input type="number" [(ngModel)]="experience" name="experience" min="0" max="15"
                class="w-full glass-card border border-black/10 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-all placeholder-gray-400"
                placeholder="0">
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Target Role</label>
              <input type="text" [(ngModel)]="role" name="role" required
                class="w-full glass-card border border-black/10 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-all placeholder-gray-400"
                placeholder="e.g. Senior Frontend Engineer">
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Skills & Technologies</label>
              <textarea [(ngModel)]="skills" name="skills" rows="3"
                class="w-full glass-card border border-black/10 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-all placeholder-gray-400 resize-none"
                placeholder="e.g. React, TypeScript, Node.js, AWS, System Design"></textarea>
            </div>

            @if(successMessage()) {
                <div class="text-green-600 font-medium my-2">
                    {{ successMessage() }}
                </div>
            }

            <button type="submit" [disabled]="saving()"
              class="w-full bg-black hover:bg-gray-800 text-white font-bold py-2.5 sm:py-3 md:py-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[40px] sm:min-h-[44px] disabled:opacity-50">
              {{ saving() ? 'Saving...' : 'Save Profile' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class DashboardResumeComponent {
  authService = inject(AuthService);

  resumeFileName = signal<string>('');
  fileSize = signal<string>('');
  name = signal('');
  email = signal('');
  experience = signal(0);
  role = signal('');
  skills = signal('');

  selectedFile: File | null = null;
  resumeDownloadUrl = signal<string>('');

  uploading = signal(false);
  uploadProgress = signal(0);
  saving = signal(false);
  successMessage = signal('');

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.name.set(user.name || '');
      this.email.set(user.email || '');
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;
      this.resumeFileName.set(file.name);
      this.fileSize.set(this.formatFileSize(file.size));
      this.error.set(''); // Clear previous errors

      if (file.type === 'application/pdf') {
        await this.extractTextFromPDF(file);
      } else {
        this.error.set('Only PDF files are supported.');
        this.removeFile();
      }
    }
  }

  async extractTextFromPDF(file: File) {
    this.uploading.set(true);
    this.uploadProgress.set(50);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n'; // Changed to '\n' for consistency
      }
      this.resumeText.set(fullText);
      this.uploadProgress.set(100);
    } catch (e: any) {
      console.error("PDF Parsing failed", e);
      this.error.set("Failed to parse PDF.");
      this.removeFile();
    } finally {
      setTimeout(() => {
        this.uploading.set(false);
      }, 1000);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  removeFile() {
    this.resumeFileName.set('');
    this.fileSize.set('');
    this.selectedFile = null;
    this.resumeText.set(''); // Changed from resumeDownloadUrl
    this.error.set(''); // Added error clear
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    const user = this.authService.currentUser();
    if (!user) return;

    this.saving.set(true);
    this.successMessage.set('');

    try {
      const updates: any = {};
      updates[`users/${user.id}/profile`] = {
        name: this.name(),
        email: this.email(),
        experience: this.experience(),
        role: this.role(),
        skills: this.skills(),
        resumeText: this.resumeText() // Changed from resumeUrl
      };

      if (this.name() !== user.name) {
        updates[`users/${user.id}/name`] = this.name();
      }

      await update(dbRef(database), updates);
      this.successMessage.set('Profile saved successfully!');
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      this.saving.set(false);
    }
  }
}
