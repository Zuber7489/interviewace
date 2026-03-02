
import { Component, signal, inject, NgZone, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

// FIX (10): Map raw Firebase auth error codes to friendly messages
function getFriendlyAuthError(err: any): string {
  const code = err?.code || '';
  const map: Record<string, string> = {
    'auth/invalid-credential': 'Incorrect email or password. Please try again.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists. Please log in instead.',
    'auth/invalid-email': 'That doesn\'t look like a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Another sign-in is already in progress.',
    'auth/user-disabled': 'This account has been suspended.',
  };
  if (map[code]) return map[code];
  if (err?.message && !err.message.includes('auth/')) return err.message;
  return 'Something went wrong. Please try again.';
}

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- FIX (8): Added gradient background -->
    <div class="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 md:py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <!-- Subtle grid background -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 32px 32px;"></div>

      <div class="glass w-full max-w-md p-4 sm:p-6 md:p-8 rounded-2xl border border-black/10 animate-fade-in relative z-10 shadow-xl shadow-black/5">
        
        <div class="text-center mb-4 sm:mb-6 md:mb-8">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-black rounded-xl mb-4">
              <i class="fas fa-user-plus text-white text-lg"></i>
            </div>
            <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-black">Create Account</h2>
            <p class="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Get 2 free interviews — no credit card needed</p>
        </div>

        @if(error()) {
            <div class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-sm text-center flex items-center justify-center gap-2">
                <i class="fas fa-exclamation-circle text-xs"></i>
                {{ error() }}
            </div>
        }

        <form (submit)="onSubmit($event)" class="space-y-3 sm:space-y-4">
          <div>
            <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Full Name</label>
            <input type="text" [(ngModel)]="name" name="name" id="signup-name" required 
                   class="w-full border border-black/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-black bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 transition-all placeholder-gray-400 text-sm sm:text-base"
                   placeholder="John Doe" autocomplete="name">
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" id="signup-email" required 
                   class="w-full border border-black/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-black bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 transition-all placeholder-gray-400 text-sm sm:text-base"
                   placeholder="you@example.com" autocomplete="email">
          </div>
          
          <!-- FIX (9): Show/Hide password + strength indicator -->
          <div>
            <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Password</label>
            <div class="relative">
              <input [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="password" name="password" id="signup-password" required minlength="6"
                     class="w-full border border-black/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 pr-12 text-black bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 transition-all placeholder-gray-400 text-sm sm:text-base"
                     placeholder="Min. 6 characters" autocomplete="new-password">
              <button type="button" (click)="toggleShowPassword()"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                      [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                <i [class]="showPassword() ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-sm"></i>
              </button>
            </div>
            <!-- Password strength bar -->
            @if(password.length > 0) {
              <div class="mt-2 flex gap-1">
                <div class="h-1 flex-1 rounded-full transition-all" [class]="password.length >= 2 ? 'bg-red-400' : 'bg-gray-200'"></div>
                <div class="h-1 flex-1 rounded-full transition-all" [class]="password.length >= 6 ? 'bg-amber-400' : 'bg-gray-200'"></div>
                <div class="h-1 flex-1 rounded-full transition-all" [class]="password.length >= 10 ? 'bg-green-500' : 'bg-gray-200'"></div>
              </div>
              <p class="text-[10px] text-gray-400 mt-1">{{ passwordStrengthLabel() }}</p>
            }
          </div>

          <button type="submit" [disabled]="isLoading()" id="signup-submit"
                  class="w-full bg-black hover:bg-gray-800 text-white font-bold py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] hover:shadow-lg hover:shadow-black/20 mt-1">
            @if(isLoading()) {
              <span class="flex items-center justify-center gap-2"><i class="fas fa-circle-notch fa-spin"></i> Creating Account...</span>
            } @else {
              Create Account — Free
            }
          </button>
        </form>

        <div class="my-5 flex items-center">
            <div class="flex-grow border-t border-black/10"></div>
            <span class="flex-shrink-0 mx-4 text-gray-400 text-xs sm:text-sm">or</span>
            <div class="flex-grow border-t border-black/10"></div>
        </div>

        <button type="button" (click)="onGoogleLogin()" [disabled]="isLoading()" id="signup-google"
                class="w-full bg-white hover:bg-gray-50 border border-black/10 text-gray-700 font-bold py-2.5 sm:py-3 px-4 rounded-xl transition-all shadow-sm duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center gap-2 mb-4 hover:border-black/20">
          <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div class="mt-4 sm:mt-5 text-center space-y-3">
            <p class="text-gray-500 text-xs sm:text-sm">
                Already have an account? 
                <a routerLink="/login" class="text-black font-bold hover:underline transition-colors">Log In</a>
            </p>
            <p class="text-[10px] sm:text-xs text-gray-400">
              By signing up, you agree to our 
              <a routerLink="/terms-of-service" class="underline hover:text-gray-600">Terms of Service</a> and 
              <a routerLink="/privacy-policy" class="underline hover:text-gray-600">Privacy Policy</a>.
            </p>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);
  ngZone = inject(NgZone);

  name = '';
  email = '';
  password = '';
  error = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  // FIX: Method wrapper for arrow fn restriction in Angular templates
  toggleShowPassword() { this.showPassword.set(!this.showPassword()); }

  // FIX (11): Password strength label
  passwordStrengthLabel = computed(() => {
    const len = this.password.length;
    if (len === 0) return '';
    if (len < 6) return 'Too short';
    if (len < 10) return 'Moderate';
    return 'Strong';
  });

  async onSubmit(e: Event) {
    e.preventDefault();
    if (!this.name || !this.email || !this.password) return;

    this.isLoading.set(true);
    this.error.set('');

    try {
      await this.authService.signup({
        name: this.name,
        email: this.email,
        password: this.password
      });
      this.toastService.success('Account created successfully!');
      this.ngZone.run(() => {
        this.router.navigate(['/dashboard']);
      });
    } catch (err: any) {
      // FIX (10): Use friendly error messages
      this.error.set(getFriendlyAuthError(err));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onGoogleLogin() {
    this.isLoading.set(true);
    this.error.set('');

    try {
      await this.authService.loginWithGoogle();
      this.toastService.success('Successfully registered with Google!');
      this.ngZone.run(() => {
        this.router.navigate(['/dashboard']);
      });
    } catch (err: any) {
      // FIX (10): Use friendly error messages
      this.error.set(getFriendlyAuthError(err));
    } finally {
      this.isLoading.set(false);
    }
  }
}
