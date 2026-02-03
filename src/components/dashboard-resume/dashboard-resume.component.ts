import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-resume',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-2 sm:px-4">
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-4 sm:mb-6 md:mb-8">Upload Resume</h1>
      
      <div class="glass-card p-3 sm:p-4 md:p-6 lg:p-8 rounded-2xl border border-black/5">
        <div class="mb-4 sm:mb-6 md:mb-8">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4">Upload PDF Resume</h2>
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
          
          <form (submit)="onSubmit()" class="space-y-3 sm:space-y-4 md:space-y-6">
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

            <button type="submit"
              class="w-full bg-black hover:bg-gray-800 text-white font-bold py-2.5 sm:py-3 md:py-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[40px] sm:min-h-[44px]">
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class DashboardResumeComponent {
  resumeFileName = signal<string>('');
  fileSize = signal<string>('');
  name = signal('');
  email = signal('');
  experience = signal(0);
  role = signal('');
  skills = signal('');

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.resumeFileName.set(file.name);
      this.fileSize.set(this.formatFileSize(file.size));
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
  }

  onSubmit() {
    // Handle form submission
    console.log('Profile saved:', {
      name: this.name(),
      email: this.email(),
      experience: this.experience(),
      role: this.role(),
      skills: this.skills(),
      resume: this.resumeFileName()
    });
  }
}
