import { Component, inject, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Menu Button -->
    <button 
      (click)="toggleSidebar()"
      class="lg:hidden fixed top-3 sm:top-4 left-3 sm:left-4 z-[1001] bg-black text-white p-2.5 sm:p-3 rounded-lg shadow-lg hover:bg-gray-800 transition-all min-w-[44px] min-h-[44px]"
      aria-label="Toggle menu">
      <i class="fas fa-bars text-base sm:text-lg"></i>
    </button>

    <!-- Overlay for mobile -->
    @if (isSidebarOpen) {
      <div 
        (click)="toggleSidebar()"
        class="lg:hidden fixed inset-0 bg-black/50 z-[999] backdrop-blur-sm transition-opacity"></div>
    }

    <!-- Sidebar -->
    <aside 
      [class.translate-x-0]="isSidebarOpen"
      [class.-translate-x-full]="!isSidebarOpen"
      class="w-64 h-screen bg-white border-r-2 border-black/10 flex flex-col fixed left-0 top-0 shadow-lg z-50 transition-transform duration-300 ease-in-out">
      
      <!-- Logo -->
      <div class="p-6 border-b border-black/10 bg-gray-50 flex items-center justify-center h-20 sm:h-24 lg:h-auto">
        <button routerLink="/dashboard" (click)="closeSidebarOnMobile()" class="flex items-center gap-2 group mb-[10px]">
          <i class="fas fa-brain text-black text-2xl group-hover:scale-110 transition-transform"></i>
          <span class="text-xl font-bold text-black tracking-tight">ScoreMyInterview</span>
        </button>
      </div>

      <!-- User Profile -->
      <div class="p-4 sm:p-6 border-b border-black/10">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-black/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            @if(currentUser()?.photoURL) {
              <img [src]="currentUser()?.photoURL" alt="Profile" class="w-full h-full object-cover">
            } @else {
              <i class="fas fa-user text-black text-sm sm:text-lg"></i>
            }
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-black text-xs sm:text-sm truncate flex items-center gap-1.5">
              {{ currentUser()?.name || 'User' }}
              @if(currentUser()?.subscription === 'pro') {
                <i class="fas fa-crown text-amber-500 text-[10px]" title="Pro Member"></i>
              }
            </p>
            <p class="text-[10px] sm:text-xs text-gray-600 truncate">{{ currentUser()?.email || '' }}</p>
          </div>
        </div>
        @if(currentUser()?.subscription === 'free') {
          <div class="mt-4 p-3 bg-black rounded-xl text-white text-[10px] sm:text-xs">
            <p class="font-bold mb-1 italic">Free Plan: {{ (currentUser()?.interviewsCount || 0) }}/{{ currentUser()?.maxInterviews ?? 2 }} used</p>
            <a routerLink="/dashboard/settings" class="underline hover:text-gray-300">Buy Pro Pack — ₹200</a>
          </div>
        }
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        
        <a routerLink="/dashboard" routerLinkActive="bg-black text-white font-bold" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebarOnMobile()"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all min-h-[44px]">
          <i class="fas fa-chart-pie w-4 sm:w-5 flex-shrink-0"></i>
          <span class="text-sm sm:text-base">Overview</span>
        </a>

        <a routerLink="/dashboard/interviews" routerLinkActive="bg-black text-white font-bold" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebarOnMobile()"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all min-h-[44px]">
          <i class="fas fa-bolt w-4 sm:w-5 flex-shrink-0 text-yellow-500"></i>
          <span class="text-sm sm:text-base">Mock Interview</span>
        </a>

        <a routerLink="/dashboard/history" routerLinkActive="bg-black text-white font-bold" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebarOnMobile()"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all min-h-[44px]">
          <i class="fas fa-history w-4 sm:w-5 flex-shrink-0"></i>
          <span class="text-sm sm:text-base">Past Interviews</span>
          @if(history().length > 0) {
          <span class="ml-auto bg-white text-black text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">{{ history().length }}</span>
          }
        </a>

        <a routerLink="/dashboard/settings" routerLinkActive="bg-black text-white font-bold" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebarOnMobile()"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all min-h-[44px]">
          <i class="fas fa-cog w-4 sm:w-5 flex-shrink-0"></i>
          <span class="text-sm sm:text-base">Settings</span>
        </a>

        @if(currentUser()?.isAdmin) {
        <a routerLink="/dashboard/admin" routerLinkActive="bg-black text-white font-bold" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebarOnMobile()"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-red-600 transition-all min-h-[44px]">
          <i class="fas fa-shield-alt w-4 sm:w-5 flex-shrink-0 text-red-500"></i>
          <span class="text-sm sm:text-base font-bold text-red-500">Admin Panel</span>
        </a>
        }

        <a routerLink="/contact" routerLinkActive="bg-black text-white font-bold" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebarOnMobile()"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all min-h-[44px]">
          <i class="fas fa-question-circle w-4 sm:w-5 flex-shrink-0"></i>
          <span class="text-sm sm:text-base">Help & Support</span>
        </a>

        <button (click)="logout()"
          class="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-red-500/10 hover:text-red-600 transition-all min-h-[44px]">
          <i class="fas fa-sign-out-alt w-4 sm:w-5 flex-shrink-0"></i>
          <span class="text-sm sm:text-base">Logout</span>
        </button>
      </nav>

      


    </aside>
  `,
  styles: [`
    aside {
      z-index: 1000;
      position: fixed;
    }

    /* Mobile styles - sidebar hidden by default */
    @media (max-width: 1023px) {
      aside {
        transform: translateX(-100%);
      }
      
      aside.translate-x-0 {
        transform: translateX(0);
      }
    }

    /* Desktop styles - sidebar always visible */
    @media (min-width: 1024px) {
      aside {
        transform: translateX(0) !important;
      }
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

    /* Responsive text sizes */
    @media (max-width: 640px) {
      aside {
        width: 100%;
      }
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
  stateService = inject(StateService);
  router = inject(Router);
  ngZone = inject(NgZone);

  currentUser = this.authService.currentUser;
  history = this.stateService.history;
  isSidebarOpen = false;



  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = false;
    }
  }

  get sidebarClasses(): string {
    return '';
  }

  async logout() {
    try {
      await this.authService.logout();
      this.ngZone.run(() => {
        this.router.navigate(['/login']);
      });
    } catch (error) {
      // logout errors are handled silently
    }
  }

  viewReport(sessionId: string) {
    this.stateService.loadSession(sessionId);
    this.router.navigate(['/report']);
  }
}
