import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { getDatabase, ref as dbRef, update, get } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebase.config';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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
          
          <form (submit)="updateProfile($event)" class="space-y-2 sm:space-y-3 md:space-y-4">
            <div>
              <label class="block text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Full Name</label>
              <input type="text" [(ngModel)]="name" name="name" required
                class="w-full glass-card border border-black/10 rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-all text-xs sm:text-sm md:text-base">
            </div>

            <div>
              <label class="block text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" disabled
                class="w-full glass-card border border-black/10 rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-gray-600 bg-gray-100 cursor-not-allowed text-xs sm:text-sm md:text-base">
            </div>

            @if(profileSuccess()) {
                <div class="text-green-600 text-sm py-1 font-medium">{{ profileSuccess() }}</div>
            }

            <button type="submit" [disabled]="savingProfile()"
              class="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px] disabled:opacity-50">
              {{ savingProfile() ? 'Updating...' : 'Update Profile' }}
            </button>
          </form>
        </div>

        <!-- Interview Preferences -->
        <div class="glass-card p-3 sm:p-4 md:p-6 rounded-2xl border border-black/5">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4 md:mb-6">Interview Preferences</h2>
          
          <form (submit)="savePreferences($event)" class="space-y-2 sm:space-y-3 md:space-y-4">
            <div>
              <label class="block text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Default Interview Duration</label>
              <select [(ngModel)]="defaultDuration" name="duration"
                class="w-full glass-card border border-black/10 rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 text-xs sm:text-sm md:text-base">
                <option [value]="10">10 minutes</option>
                <option [value]="20">20 minutes</option>
                <option [value]="30">30 minutes</option>
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

            @if(prefSuccess()) {
                <div class="text-green-600 text-sm py-1 font-medium">{{ prefSuccess() }}</div>
            }

            <button type="submit" [disabled]="savingPref()"
              class="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px] disabled:opacity-50">
              {{ savingPref() ? 'Saving...' : 'Save Preferences' }}
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

  savingProfile = signal(false);
  profileSuccess = signal('');

  savingPref = signal(false);
  prefSuccess = signal('');

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.name.set(user.name);
        this.email.set(user.email);
        this.loadPreferences(user.id);
      }
    });
  }

  async loadPreferences(uid: string) {
    try {
      const snap = await get(dbRef(database, `users/${uid}/preferences`));
      if (snap.exists()) {
        const prefs = snap.val();
        if (prefs.duration) this.defaultDuration.set(prefs.duration);
        if (prefs.language) this.preferredLanguage.set(prefs.language);
      }
    } catch (e) {
      console.error("Failed to load prefs", e);
    }
  }

  async updateProfile(e: Event) {
    e.preventDefault();
    const user = this.currentUser();
    if (!user || !this.name()) return;

    this.savingProfile.set(true);
    this.profileSuccess.set('');

    try {
      await update(dbRef(database, `users/${user.id}`), {
        name: this.name()
      });
      this.profileSuccess.set('Profile updated successfully!');
      setTimeout(() => this.profileSuccess.set(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      this.savingProfile.set(false);
    }
  }

  async savePreferences(e: Event) {
    e.preventDefault();
    const user = this.currentUser();
    if (!user) return;

    this.savingPref.set(true);
    this.prefSuccess.set('');

    try {
      await update(dbRef(database, `users/${user.id}/preferences`), {
        duration: Number(this.defaultDuration()),
        language: this.preferredLanguage()
      });
      this.prefSuccess.set('Preferences saved successfully!');
      setTimeout(() => this.prefSuccess.set(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      this.savingPref.set(false);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
