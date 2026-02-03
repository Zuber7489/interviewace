import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 h-screen bg-white border-r-2 border-black/10 flex flex-col fixed left-0 top-0 shadow-lg z-50">
      <!-- Logo -->
      <div class="p-6 border-b border-black/10 bg-gray-50">
        <button routerLink="/dashboard" class="flex items-center gap-2 group">
          <i class="fas fa-brain text-black text-2xl group-hover:scale-110 transition-transform"></i>
          <span class="text-xl font-bold text-black tracking-tight">InterviewAce</span>
        </button>
      </div>

      <!-- User Profile -->
      <div class="p-6 border-b border-black/10">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-black text-lg"></i>
          </div>
          <div class="flex-1">
            <p class="font-bold text-black text-sm">{{ currentUser()?.name || 'User' }}</p>
            <p class="text-xs text-gray-600">{{ currentUser()?.email || '' }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">Main</div>
        
        <a routerLink="/dashboard" routerLinkActive="bg-black/10 text-black"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all">
          <i class="fas fa-home w-5"></i>
          <span>Dashboard</span>
        </a>



        <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3 mt-6">History</div>
        
        <a routerLink="/dashboard/history" routerLinkActive="bg-black/10 text-black"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all">
          <i class="fas fa-history w-5"></i>
          <span>Past Interviews</span>
          @if(history().length > 0) {
          <span class="ml-auto bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ history().length }}</span>
          }
        </a>

        <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3 mt-6">Profile</div>
        
        <a routerLink="/dashboard/resume" routerLinkActive="bg-black/10 text-black"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all">
          <i class="fas fa-file-upload w-5"></i>
          <span>Upload Resume</span>
        </a>

        <a routerLink="/dashboard/settings" routerLinkActive="bg-black/10 text-black"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all">
          <i class="fas fa-cog w-5"></i>
          <span>Settings</span>
        </a>
      </nav>

      

      <!-- Logout -->
      <div class="p-4 border-t border-black/10">
        <button (click)="logout()"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-500/10 hover:text-red-600 transition-all">
          <i class="fas fa-sign-out-alt w-5"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    aside {
      z-index: 1000;
      position: fixed;
    }
    ::-webkit-scrollbar {
      width: 4px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 2px;
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
  stateService = inject(StateService);
  router = inject(Router);

  currentUser = this.authService.currentUser;
  history = this.stateService.history;

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  viewReport(sessionId: string) {
    this.stateService.loadSession(sessionId);
    this.router.navigate(['/report']);
  }
}
