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
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
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
                  <h3 class="font-bold text-sm sm:text-base">Buy Pro Pack — ₹199</h3>
                  <p class="text-[10px] sm:text-xs text-gray-400">Get 10 extra interviews. Buy again anytime you run out.</p>
                </div>
                <button (click)="upgradeToPro()" [disabled]="upgrading()"
                  class="whitespace-nowrap px-4 py-2 bg-white text-black text-xs sm:text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
                  {{ upgrading() ? 'Processing...' : 'Buy Pack — ₹199' }}
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


        <!-- Account Actions -->
        <div class="glass-card p-3 sm:p-4 md:p-6 rounded-2xl border border-black/5">
          <h2 class="text-base sm:text-lg md:text-xl font-bold text-black mb-3 sm:mb-4 md:mb-6">Account Actions</h2>
          
          <div class="space-y-2 sm:space-y-3">

            <!-- Change Password via email link -->
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

            <!-- Delete Account -->
            <div class="pt-2 border-t border-black/5">
              <button (click)="openDeleteModal()" [disabled]="deletingAccount()"
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

    <!-- ══════════════════════════════════════════
         DELETE ACCOUNT MODAL — Step 1: Warning
    ══════════════════════════════════════════ -->
    @if(showDeleteModal()) {
      <div class="fixed inset-0 z-[9000] flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.5); backdrop-filter:blur(6px);"
           (click)="closeDeleteModal()">
        <div class="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-center"
             style="animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1);"
             (click)="$event.stopPropagation()">

          <!-- Icon -->
          <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <i class="fas fa-user-slash text-red-500 text-2xl"></i>
          </div>

          <h3 class="text-xl font-extrabold text-black mb-2">Delete Account?</h3>
          <p class="text-sm text-gray-500 leading-relaxed mb-2">
            This will <strong class="text-black">permanently delete</strong> your account, all interview history, and scores.
          </p>
          <div class="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
            <p class="text-xs text-red-600 font-semibold text-center leading-relaxed">
              ⚠️&nbsp; This action <span class="font-extrabold text-red-700">CANNOT be undone</span>. Your data will be gone forever.
            </p>
          </div>

          <div class="flex gap-3">
            <button (click)="closeDeleteModal()"
              class="flex-1 py-3 rounded-xl border border-black/10 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button (click)="proceedToConfirm()"
              class="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
              Yes, Continue
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ══════════════════════════════════════════
         DELETE ACCOUNT MODAL — Step 2: Final Confirm
    ══════════════════════════════════════════ -->
    @if(showFinalConfirm()) {
      <div class="fixed inset-0 z-[9000] flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.6); backdrop-filter:blur(6px);"
           (click)="closeFinalConfirm()">
        <div class="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-center"
             style="animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1);"
             (click)="$event.stopPropagation()">

          <!-- Icon -->
          <div class="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
            <i class="fas fa-trash-alt text-red-600 text-2xl"></i>
          </div>

          <h3 class="text-xl font-extrabold text-black mb-2">Final Confirmation</h3>
          <p class="text-sm text-gray-500 mb-1">Deleting account for:</p>
          <p class="text-sm font-bold text-black bg-gray-100 rounded-lg px-3 py-2 mb-5 break-all">
            {{ currentUser()?.email }}
          </p>
          <p class="text-xs text-gray-400 mb-6">Type <strong class="text-black">DELETE</strong> below to confirm:</p>

          <input type="text" [(ngModel)]="deleteConfirmText"
            placeholder="Type DELETE here"
            class="w-full border-2 rounded-xl px-4 py-3 text-center text-sm font-bold tracking-widest uppercase mb-5 outline-none transition-all"
            [class.border-red-500]="deleteConfirmText && deleteConfirmText.toUpperCase() !== 'DELETE'"
            [class.border-green-500]="deleteConfirmText.toUpperCase() === 'DELETE'"
            [class.border-gray-200]="!deleteConfirmText">

          <div class="flex gap-3">
            <button (click)="closeFinalConfirm()"
              class="flex-1 py-3 rounded-xl border border-black/10 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button (click)="executeDeleteAccount()"
              [disabled]="deleteConfirmText.toUpperCase() !== 'DELETE' || deletingAccount()"
              class="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              @if(deletingAccount()) {
                <i class="fas fa-circle-notch fa-spin text-xs"></i> Deleting...
              } @else {
                <i class="fas fa-trash text-xs"></i> Delete Forever
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.9) translateY(10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class DashboardSettingsComponent {
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);
  ngZone = inject(NgZone);

  currentUser = this.authService.currentUser;

  name = signal('');
  email = signal('');

  savingProfile = signal(false);
  profileSuccess = signal('');

  upgrading = signal(false);

  sendingReset = signal(false);
  resetSent = signal(false);

  deletingAccount = signal(false);

  // Delete modal state
  showDeleteModal = signal(false);
  showFinalConfirm = signal(false);
  deleteConfirmText = '';

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.name.set(user.name);
        this.email.set(user.email);
      }
    });
  }

  // ── Delete modal flow ──────────────────────────────────
  openDeleteModal() { this.showDeleteModal.set(true); }
  closeDeleteModal() { this.showDeleteModal.set(false); }

  proceedToConfirm() {
    this.showDeleteModal.set(false);
    this.deleteConfirmText = '';
    this.showFinalConfirm.set(true);
  }

  closeFinalConfirm() {
    this.showFinalConfirm.set(false);
    this.deleteConfirmText = '';
  }

  async executeDeleteAccount() {
    if (this.deleteConfirmText.toUpperCase() !== 'DELETE') return;
    const user = this.currentUser();
    if (!user) return;

    this.deletingAccount.set(true);
    try {
      const { getDatabase, ref, update, remove } = await import('firebase/database');
      const db = getDatabase();

      await update(ref(db, `users/${user.id}`), {
        deleted: true,
        deletedAt: Date.now(),
        name: '[Deleted User]',
        email: '[deleted]',
      });

      await remove(ref(db, `users/${user.id}/history`));

      await this.authService.logout();
      this.showFinalConfirm.set(false);
      this.ngZone.run(() => {
        this.router.navigate(['/']);
        setTimeout(() => this.toastService.success('Your account has been deleted.'), 500);
      });
    } catch (err: any) {
      this.toastService.error('Failed to delete account. Please contact support.');
    } finally {
      this.deletingAccount.set(false);
    }
  }

  // ── Profile ────────────────────────────────────────────
  async updateProfile(e: Event) {
    e.preventDefault();
    const user = this.currentUser();
    if (!user || !this.name()) return;

    this.savingProfile.set(true);
    this.profileSuccess.set('');
    try {
      await update(dbRef(database, `users/${user.id}`), { name: this.name() });
      this.toastService.success('Profile updated successfully!');
      this.profileSuccess.set('Profile updated successfully!');
      setTimeout(() => this.profileSuccess.set(''), 3000);
    } catch {
      this.toastService.error('Failed to update profile.');
    } finally {
      this.savingProfile.set(false);
    }
  }

  // ── Upgrade ────────────────────────────────────────────
  async upgradeToPro() {
    const user = this.currentUser();
    if (!user) return;
    this.upgrading.set(true);
    try {
      const auth = (await import('firebase/auth')).getAuth();
      if (!auth.currentUser) throw new Error('Not authenticated');
      const idToken = await auth.currentUser.getIdToken();
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockPaymentDetails = {
        razorpay_order_id: 'order_' + Math.random().toString(36).substr(2, 9),
        razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
        razorpay_signature: 'mock_signature_for_demo'
      };
      const response = await fetch('/api/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify(mockPaymentDetails)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Payment verification failed');
      }
      const data = await response.json();
      this.authService.currentUser.update(u => u ? ({ ...u, subscription: data.subscription || 'pro', maxInterviews: data.maxInterviews ?? 10 }) : u);
      this.toastService.success(`Pro Pack activated! You now have ${data.maxInterviews} total interviews.`);
    } catch (e: any) {
      this.toastService.error(e.message || 'Upgrade failed. Please try again.');
    } finally {
      this.upgrading.set(false);
    }
  }

  // ── Logout ─────────────────────────────────────────────
  async logout() {
    try {
      await this.authService.logout();
      this.ngZone.run(() => this.router.navigate(['/']));
    } catch { }
  }

  // ── Password Reset ─────────────────────────────────────
  async sendPasswordReset() {
    const user = this.currentUser();
    if (!user?.email) return;
    this.sendingReset.set(true);
    this.resetSent.set(false);
    try {
      const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(getAuth(), user.email);
      this.resetSent.set(true);
      setTimeout(() => this.resetSent.set(false), 8000);
    } catch (err: any) {
      this.toastService.error(err.message || 'Failed to send reset email.');
    } finally {
      this.sendingReset.set(false);
    }
  }
}
