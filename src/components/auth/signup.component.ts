
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-signup',
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 md:py-12">
      <div class="glass w-full max-w-md p-4 sm:p-6 md:p-8 rounded-2xl border border-black/10 animate-fade-in relative z-10">
        
        <div class="text-center mb-4 sm:mb-6 md:mb-8">
            <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-black">Create Account</h2>
            <p class="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Start your interview journey today</p>
        </div>

        @if(error()) {
            <div class="bg-gray-500/10 border border-gray-500/20 text-gray-600 p-3 rounded-lg mb-4 text-sm text-center">
                {{ error() }}
            </div>
        }

        <form (submit)="onSubmit($event)" class="space-y-3 sm:space-y-4 md:space-y-5">
          <div>
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name</label>
            <input type="text" [(ngModel)]="name" name="name" required 
                   class="w-full glass-card border border-black/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-black focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all placeholder-gray-400 text-sm sm:text-base"
                   placeholder="John Doe">
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" required 
                   class="w-full glass-card border border-black/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-black focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all placeholder-gray-400 text-sm sm:text-base"
                   placeholder="you@example.com">
          </div>
          
          <div>
             <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="6"
                   class="w-full glass-card border border-black/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-black focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all placeholder-gray-400 text-sm sm:text-base"
                   placeholder="••••••••">
          </div>

          <button type="submit" [disabled]="isLoading()" 
                  class="w-full bg-black hover:bg-gray-800 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]">
            {{ isLoading() ? 'Creating Account...' : 'Sign Up' }}
          </button>
        </form>

        <div class="mt-4 sm:mt-6 text-center">
            <p class="text-gray-600 text-xs sm:text-sm">
                Already have an account? 
                <a routerLink="/login" class="text-gray-800 hover:text-black font-medium transition-colors">Log In</a>
            </p>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
    authService = inject(AuthService);
    router = inject(Router);

    name = '';
    email = '';
    password = '';
    error = signal('');
    isLoading = signal(false);

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
            this.router.navigate(['/dashboard']);
        } catch (err: any) {
            this.error.set(err.message || 'Email already registered or another error occurred');
        } finally {
            this.isLoading.set(false);
        }
    }
}
