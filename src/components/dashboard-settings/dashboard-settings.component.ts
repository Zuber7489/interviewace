import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-settings',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-2 sm:px-4">
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-4 sm:mb-6 md:mb-8">Settings</h1>
      
      <div class="space-y-3 sm:space-y-4 md:space-y-6">
        <!-- Profile Settings -->
        <div class="glass-card p-3 sm:p-4 md:p-6 rounded-2xl border border-black/5">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4 md:mb-6">Profile Settings</h2>
          
          <form (submit)="updateProfile()" class="space-y-2 sm:space-y-3 md:space-y-4">
            <div>
              <label class="block text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Full Name</label>
              <input type="text" [(ngModel)]="name" name="name"
                class="w-full glass-card border border-black/10 rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-all text-xs sm:text-sm md:text-base">
            </div>

            <div>
              <label class="block text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" disabled
                class="w-full glass-card border border-black/10 rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-gray-600 bg-gray-100 cursor-not-allowed text-xs sm:text-sm md:text-base">
            </div>

            <button type="submit"
              class="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px]">
              Update Profile
            </button>
          </form>
        </div>

        <!-- Interview Preferences -->
        <div class="glass-card p-3 sm:p-4 md:p-6 rounded-2xl border border-black/5">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4 md:mb-6">Interview Preferences</h2>
          
          <form (submit)="savePreferences()" class="space-y-2 sm:space-y-3 md:space-y-4">
            <div>
              <label class="block text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Default Interview Duration</label>
              <select [(ngModel)]="defaultDuration" name="duration"
                class="w-full glass-card border border-black/10 rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 text-xs sm:text-sm md:text-base">
                <option value="10">10 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Preferred Language</label>
              <select [(ngModel)]="preferredLanguage" name="language"
                class="w-full glass-card border border-black/10 rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 text-xs sm:text-sm md:text-base">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            <button type="submit"
              class="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px]">
              Save Preferences
            </button>
          </form>
        </div>

        <!-- Account Actions -->
        <div class="glass-card p-3 sm:p-4 md:p-6 rounded-2xl border border-black/5">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4 md:mb-6">Account Actions</h2>
          
          <div class="space-y-2 sm:space-y-3 md:space-y-4">
            <button (click)="logout()"
              class="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-black/20 text-gray-600 rounded-lg hover:bg-black/5 hover:text-black transition-all font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px]">
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </button>

            <button (click)="deleteAccount()"
              class="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px]">
              <i class="fas fa-trash"></i>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardSettingsComponent {
  authService = inject(AuthService);
  router = inject(Router);

  currentUser = this.authService.currentUser;
  name = signal('');
  email = signal('');
  defaultDuration = signal(20);
  preferredLanguage = signal('English');

  constructor() {
    const user = this.currentUser();
    if (user) {
      this.name.set(user.name);
      this.email.set(user.email);
    }
  }

  updateProfile() {
    // Update profile logic
    console.log('Profile updated:', this.name());
  }

  savePreferences() {
    // Save preferences logic
    console.log('Preferences saved:', {
      duration: this.defaultDuration(),
      language: this.preferredLanguage()
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Delete account logic
      console.log('Account deleted');
      this.authService.logout();
      this.router.navigate(['/signup']);
    }
  }
}
