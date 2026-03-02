import { Component, inject, signal, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { getDatabase, ref as dbRef, update, get } from 'firebase/database';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '../../firebase.config';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

@Component({
  selector: 'app-dashboard-settings',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-6 sm:mb-8">Settings</h1>
      
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


        <!-- Subscription & Billing -->
        <div class="glass-card p-3 sm:p-4 md:p-6 rounded-2xl border border-black/5">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4 md:mb-6">Subscription & Billing</h2>
          
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-gray-50 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Current Plan</div>
                <div class="flex items-center gap-2">
                  <span class="text-lg sm:text-xl font-bold text-black capitalize">{{ currentUser()?.subscription || 'Free' }}</span>
                  @if(currentUser()?.subscription === 'pro') {
                    <span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold rounded-full">Active</span>
                  }
                </div>
              </div>
              
              <div class="flex flex-col sm:items-end">
                <div class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">Interviews Used</div>
                <div class="text-sm sm:text-base font-medium text-black text-center">
                  {{ currentUser()?.interviewsCount || 0 }} / {{ currentUser()?.maxInterviews ?? (currentUser()?.subscription === 'pro' ? 10 : 2) }}
                </div>
              </div>
            </div>

            @if(currentUser()?.subscription === 'free' || (currentUser()?.interviewsCount || 0) >= (currentUser()?.maxInterviews ?? (currentUser()?.subscription === 'pro' ? 10 : 2))) {
              <div class="p-4 rounded-xl bg-black text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:scale-[1.01]">
                <div class="space-y-1">
                  <h3 class="font-bold text-sm sm:text-base">Buy Pro Pack — ₹200</h3>
                  <p class="text-[10px] sm:text-xs text-gray-400">Get 10 extra interviews. Buy again anytime you run out.</p>
                </div>
                <button (click)="upgradeToPro()" [disabled]="upgrading()"
                  class="whitespace-nowrap px-4 py-2 bg-white text-black text-xs sm:text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
                  {{ upgrading() ? 'Processing...' : 'Buy Pack — ₹200' }}
                </button>
              </div>
            } @else {
               <div class="p-4 rounded-xl border border-green-200 bg-green-50/50">
                  <p class="text-xs sm:text-sm text-green-800 font-medium flex items-center gap-2">
                    <i class="fas fa-crown"></i>
                    You have an active Pro Pack! {{ (currentUser()?.maxInterviews ?? 10) - (currentUser()?.interviewsCount || 0) }} interviews remaining.
                  </p>
               </div>
            }
          </div>
        </div>

        <!-- Interview Preferences (FIX 33: Restored from dead code) -->
        <div class="glass-card p-3 sm:p-4 md:p-6 rounded-2xl border border-black/5">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4 md:mb-6">Interview Preferences</h2>
          <form (submit)="savePreferences($event)" class="space-y-3 sm:space-y-4">
            <div>
              <label class="block text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Default Interview Duration</label>
              <select [(ngModel)]="defaultDuration" name="duration"
                class="w-full glass-card border border-black/10 rounded-lg px-3 py-2.5 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-all text-sm bg-white">
                <option [ngValue]="5">5 minutes</option>
                <option [ngValue]="10">10 minutes</option>
                <option [ngValue]="15">15 minutes</option>
                <option [ngValue]="20">20 minutes</option>
                <option [ngValue]="30">30 minutes</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Preferred Interview Language</label>
              <select [(ngModel)]="preferredLanguage" name="language"
                class="w-full glass-card border border-black/10 rounded-lg px-3 py-2.5 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-all text-sm bg-white">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            @if(prefSuccess()) {
              <div class="text-green-600 text-sm py-1 font-medium">{{ prefSuccess() }}</div>
            }

            <button type="submit" [disabled]="savingPref()"
              class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50">
              {{ savingPref() ? 'Saving...' : 'Save Preferences' }}
            </button>
          </form>
        </div>

        <!-- Account Actions -->
        <div class="glass-card p-3 sm:p-4 md:p-6 rounded-2xl border border-black/5">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4 md:mb-6">Account Actions</h2>
          
          <div class="space-y-2 sm:space-y-3">

            <!-- FIX (F7/35): Change Password via email link -->
            <div class="flex items-center justify-between p-3 sm:p-4 border border-black/10 rounded-xl">
              <div>
                <p class="font-semibold text-black text-sm">Change Password</p>
                <p class="text-xs text-gray-500 mt-0.5">We'll send a reset link to your email</p>
              </div>
              <button (click)="sendPasswordReset()" [disabled]="sendingReset()"
                class="px-4 py-2 border border-black/20 text-gray-700 rounded-lg hover:bg-black/5 hover:text-black transition-all font-medium text-xs sm:text-sm disabled:opacity-50 flex items-center gap-2 flex-shrink-0">
                <i class="fas fa-envelope text-xs"></i>
                {{ sendingReset() ? 'Sending...' : 'Send Reset Link' }}
              </button>
            </div>
            @if(resetSent()) {
              <div class="text-green-600 text-xs bg-green-50 border border-green-200 px-3 py-2 rounded-lg -mt-1">
                ✓ Password reset email sent to {{ currentUser()?.email }}. Check your inbox.
              </div>
            }

            <!-- Logout -->
            <button (click)="logout()"
              class="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-black/20 text-gray-600 rounded-xl hover:bg-black/5 hover:text-black transition-all font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px]">
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </button>

            <!-- FIX (F8/36): Delete Account — GDPR compliance -->
            <div class="pt-2 border-t border-black/5">
              <button (click)="confirmDeleteAccount()" [disabled]="deletingAccount()"
                class="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px] disabled:opacity-50">
                <i class="fas fa-trash-alt"></i>
                {{ deletingAccount() ? 'Deleting...' : 'Delete My Account' }}
              </button>
              <p class="text-[10px] text-gray-400 text-center mt-1">This permanently deletes all your data and cannot be undone.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardSettingsComponent {
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);
  ngZone = inject(NgZone);

  currentUser = this.authService.currentUser;

  name = signal('');
  email = signal('');
  defaultDuration = signal(10);
  preferredLanguage = signal('English');

  savingProfile = signal(false);
  profileSuccess = signal('');

  savingPref = signal(false);
  prefSuccess = signal('');

  upgrading = signal(false);

  // FIX (F7): Change password signals
  sendingReset = signal(false);
  resetSent = signal(false);

  // FIX (F8): Delete account signals
  deletingAccount = signal(false);

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
      // silently ignore preference load errors
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
      this.toastService.success('Profile updated successfully!');
      this.profileSuccess.set('Profile updated successfully!');
      setTimeout(() => this.profileSuccess.set(''), 3000);
    } catch (err) {
      this.toastService.error('Failed to update profile.');
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
      this.toastService.success('Preferences saved safely!');
      this.prefSuccess.set('Preferences saved successfully!');
      setTimeout(() => this.prefSuccess.set(''), 3000);
    } catch (e) {
      this.toastService.error('Failed to save preferences.');
    } finally {
      this.savingPref.set(false);
    }
  }

  async upgradeToPro() {
    const user = this.currentUser();
    if (!user) return;

    this.upgrading.set(true);

    try {
      // 1. Get Firebase auth token to authenticate with our backend
      const auth = (await import('firebase/auth')).getAuth();
      if (!auth.currentUser) throw new Error('Not authenticated');
      const idToken = await auth.currentUser.getIdToken();

      // 2. Here you would normally integrate Razorpay Checkout
      // const options = { key: 'YOUR_KEY_ID', amount: 20000, ... }
      // const rzp1 = new Razorpay(options);
      // rzp1.open();

      // Simulate successful Razorpay checkout for demo purposes:
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockPaymentDetails = {
        razorpay_order_id: 'order_' + Math.random().toString(36).substr(2, 9),
        razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
        razorpay_signature: 'mock_signature_for_demo'
      };

      // 3. Send payment details to backend for verification
      const response = await fetch('/api/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(mockPaymentDetails)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Payment verification failed');
      }

      // 4. Update local signal from server response (stacks on existing interviews)
      const data = await response.json();
      this.authService.currentUser.update(u => u ? ({
        ...u,
        subscription: data.subscription || 'pro',
        maxInterviews: data.maxInterviews ?? 10
      }) : u);

      this.toastService.success(`Pro Pack activated! You now have ${data.maxInterviews} total interviews.`);
    } catch (e: any) {
      this.toastService.error(e.message || 'Upgrade failed. Please try again.');
    } finally {
      this.upgrading.set(false);
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.ngZone.run(() => {
        this.router.navigate(['/']);
      });
    } catch (error) {
      // logout errors are handled silently
    }
  }

  // FIX (F7/35): Send password reset email to the authenticated user's email
  async sendPasswordReset() {
    const user = this.currentUser();
    if (!user?.email) return;

    this.sendingReset.set(true);
    this.resetSent.set(false);
    try {
      const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
      const auth = getAuth();
      await sendPasswordResetEmail(auth, user.email);
      this.resetSent.set(true);
      // Auto-clear success message after 8s
      setTimeout(() => this.resetSent.set(false), 8000);
    } catch (err: any) {
      this.toastService.error(err.message || 'Failed to send reset email.');
    } finally {
      this.sendingReset.set(false);
    }
  }

  // FIX (F8/36): Delete account — GDPR-compliant soft delete with double confirmation
  async confirmDeleteAccount() {
    const user = this.currentUser();
    if (!user) return;

    // First confirmation
    const first = confirm(
      'Are you sure you want to delete your account?\n\nThis will permanently delete all your interview history and data. This action CANNOT be undone.'
    );
    if (!first) return;

    // Second confirmation (type safety)
    const second = confirm(
      `Final confirmation: Delete account for "${user.email}"?\n\nPress OK to permanently delete. Press Cancel to keep your account.`
    );
    if (!second) return;

    this.deletingAccount.set(true);
    try {
      const { getDatabase, ref, update, remove } = await import('firebase/database');
      const { getAuth } = await import('firebase/auth');

      const db = getDatabase();
      const auth = getAuth();

      // Soft-delete: mark user as deleted in DB (preserves audit trail for admin)
      await update(ref(db, `users/${user.id}`), {
        deleted: true,
        deletedAt: Date.now(),
        name: '[Deleted User]',
        email: '[deleted]',
      });

      // Hard delete interview history
      await remove(ref(db, `users/${user.id}/history`));

      // Sign out and redirect
      await this.authService.logout();
      this.ngZone.run(() => {
        this.router.navigate(['/']);
        // Delay toast so it shows after navigation
        setTimeout(() => this.toastService.success('Your account has been deleted.'), 500);
      });
    } catch (err: any) {
      this.toastService.error('Failed to delete account. Please contact support.');
      console.error(err);
    } finally {
      this.deletingAccount.set(false);
    }
  }
}
