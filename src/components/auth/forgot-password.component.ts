import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 md:py-12">
      <div class="glass w-full max-w-md p-4 sm:p-6 md:p-8 rounded-2xl border border-black/10 animate-fade-in relative z-10">
        
        <div class="text-center mb-4 sm:mb-6 md:mb-8">
            <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-black">Reset Password</h2>
            <p class="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Enter your email to receive a password reset link</p>
        </div>

        @if(error()) {
            <div class="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                {{ error() }}
            </div>
        }
        
        @if(successMessage()) {
            <div class="bg-green-500/10 border border-green-500/20 text-green-600 p-3 rounded-lg mb-4 text-sm text-center">
                {{ successMessage() }}
            </div>
        }

        <form (submit)="onSubmit($event)" class="space-y-4 sm:space-y-6">
          <div>
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" required 
                   class="w-full glass-card border border-black/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-black focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all placeholder-gray-400 text-sm sm:text-base"
                   placeholder="you@example.com">
          </div>

          <button type="submit" [disabled]="isLoading() || successMessage() !== ''" 
                  class="w-full bg-black hover:bg-gray-800 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]">
            {{ isLoading() ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <div class="mt-4 sm:mt-6 text-center">
            <p class="text-gray-600 text-xs sm:text-sm">
                Remember your password? 
                <a routerLink="/login" class="text-gray-800 hover:text-black font-medium transition-colors">Sign in</a>
            </p>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
    authService = inject(AuthService);
    router = inject(Router);

    email = '';
    error = signal('');
    successMessage = signal('');
    isLoading = signal(false);

    async onSubmit(e: Event) {
        e.preventDefault();
        if (!this.email) return;

        this.isLoading.set(true);
        this.error.set('');
        this.successMessage.set('');

        try {
            await this.authService.resetPassword(this.email);
            this.successMessage.set('Password reset email sent. Check your inbox.');
        } catch (err: any) {
            this.error.set(err.message || 'Failed to send reset email');
        } finally {
            this.isLoading.set(false);
        }
    }
}
