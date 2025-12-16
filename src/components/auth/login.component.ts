
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="glass w-full max-w-md p-8 rounded-2xl border border-white/10 animate-fade-in relative z-10">
        
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-white">Welcome Back</h2>
            <p class="text-slate-400 mt-2">Login to continue your prep</p>
        </div>

        @if(error()) {
            <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
                {{ error() }}
            </div>
        }

        <form (submit)="onSubmit($event)" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" required 
                   class="w-full glass-card border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                   placeholder="you@example.com">
          </div>
          
          <div>
             <label class="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required 
                   class="w-full glass-card border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                   placeholder="••••••••">
          </div>

          <button type="submit" [disabled]="isLoading()" 
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isLoading() ? 'Logging in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-6 text-center">
            <p class="text-slate-400 text-sm">
                Don't have an account? 
                <a routerLink="/signup" class="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign up</a>
            </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
    authService = inject(AuthService);
    router = inject(Router);

    email = '';
    password = '';
    error = signal('');
    isLoading = signal(false);

    onSubmit(e: Event) {
        e.preventDefault();
        if (!this.email || !this.password) return;

        this.isLoading.set(true);
        this.error.set('');

        // Simulate network delay for effect
        setTimeout(() => {
            const success = this.authService.login(this.email, this.password);
            this.isLoading.set(false);
            if (success) {
                this.router.navigate(['/dashboard']);
            } else {
                this.error.set('Invalid email or password');
            }
        }, 800);
    }
}
