import { Component, inject, signal } from '@angular/core';
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
      [class]="sidebarClasses"
      [class.translate-x-0]="isSidebarOpen"
      [class.-translate-x-full]="!isSidebarOpen"
      class="w-64 h-screen bg-white border-r-2 border-black/10 flex flex-col fixed left-0 top-0 shadow-lg z-50 transition-transform duration-300 ease-in-out">
      
      <!-- Report Generation Toggle -->
      <div class="p-3 sm:p-4 border-b border-black/10 bg-gray-50">
        <div class="flex items-center justify-between">
          <span class="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">
            <i class="fas fa-chart-line mr-1.5 sm:mr-2"></i> Report Generation
          </span>
          <button 
            (click)="toggleReportGeneration()"
            [class]="enableReports() ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'"
            class="relative w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-black/20">
            <div 
              [class.translate-x-full]="enableReports()"
              class="absolute top-0.5 sm:top-1 left-0.5 sm:left-1 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transition-transform duration-300">
            </div>
          </button>
        </div>
        <p class="text-[8px] sm:text-[9px] text-gray-500 mt-1 sm:mt-1.5">
          {{ enableReports() ? 'AI feedback enabled' : 'Save API tokens' }}
        </p>
      </div>

      <!-- Logo -->
      <div class="p-6 border-b border-black/10 bg-gray-50">
        <button routerLink="/dashboard" (click)="closeSidebarOnMobile()" class="flex items-center gap-2 group">
          <i class="fas fa-brain text-black text-2xl group-hover:scale-110 transition-transform"></i>
          <span class="text-xl font-bold text-black tracking-tight">InterviewAce</span>
        </button>
      </div>

      <!-- User Profile -->
      <div class="p-4 sm:p-6 border-b border-black/10">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-black/10 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-user text-black text-sm sm:text-lg"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-black text-xs sm:text-sm truncate">{{ currentUser()?.name || 'User' }}</p>
            <p class="text-[10px] sm:text-xs text-gray-600 truncate">{{ currentUser()?.email || '' }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        <div class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 px-2 sm:px-3">Main</div>
        
        <a routerLink="/dashboard" routerLinkActive="bg-black/10 text-black" (click)="closeSidebarOnMobile()"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all min-h-[44px]">
          <i class="fas fa-home w-4 sm:w-5 flex-shrink-0"></i>
          <span class="text-sm sm:text-base">Dashboard</span>
        </a>



        <div class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 px-2 sm:px-3 mt-4 sm:mt-6">History</div>
        
        <a routerLink="/dashboard/history" routerLinkActive="bg-black/10 text-black" (click)="closeSidebarOnMobile()"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all min-h-[44px]">
          <i class="fas fa-history w-4 sm:w-5 flex-shrink-0"></i>
          <span class="text-sm sm:text-base">Past Interviews</span>
          @if(history().length > 0) {
          <span class="ml-auto bg-black text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">{{ history().length }}</span>
          }
        </a>

        <div class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 px-2 sm:px-3 mt-4 sm:mt-6">Profile</div>
        
        <a routerLink="/dashboard/resume" routerLinkActive="bg-black/10 text-black" (click)="closeSidebarOnMobile()"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all min-h-[44px]">
          <i class="fas fa-file-upload w-4 sm:w-5 flex-shrink-0"></i>
          <span class="text-sm sm:text-base">Upload Resume</span>
        </a>

        <a routerLink="/dashboard/settings" routerLinkActive="bg-black/10 text-black" (click)="closeSidebarOnMobile()"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-black/5 hover:text-black transition-all min-h-[44px]">
          <i class="fas fa-cog w-4 sm:w-5 flex-shrink-0"></i>
          <span class="text-sm sm:text-base">Settings</span>
        </a>
      </nav>

      

      <!-- Logout -->
      <div class="p-3 sm:p-4 border-t border-black/10">
        <button (click)="logout()"
          class="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-600 hover:bg-red-500/10 hover:text-red-600 transition-all min-h-[44px]">
          <i class="fas fa-sign-out-alt w-4 sm:w-5 flex-shrink-0"></i>
          <span class="text-sm sm:text-base">Logout</span>
        </button>
      </div>
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

  currentUser = this.authService.currentUser;
  history = this.stateService.history;
  isSidebarOpen = false;

  private readonly REPORT_GENERATION_KEY = 'interviewace_report_generation';

  enableReports = signal<boolean>(this.loadReportGenerationPreference());

  private loadReportGenerationPreference(): boolean {
    try {
      const value = localStorage.getItem(this.REPORT_GENERATION_KEY);
      return value !== 'false'; // Default to true if not set
    } catch (e) {
      console.error('Failed to load report generation preference:', e);
      return true;
    }
  }

  private saveReportGenerationPreference(enabled: boolean) {
    try {
      localStorage.setItem(this.REPORT_GENERATION_KEY, enabled.toString());
    } catch (e) {
      console.error('Failed to save report generation preference:', e);
    }
  }

  toggleReportGeneration() {
    const newValue = !this.enableReports();
    this.enableReports.set(newValue);
    this.saveReportGenerationPreference(newValue);
  }

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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  viewReport(sessionId: string) {
    this.stateService.loadSession(sessionId);
    this.router.navigate(['/report']);
  }
}
