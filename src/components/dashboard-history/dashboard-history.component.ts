import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-dashboard-history',
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-2 sm:px-4">
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-4 sm:mb-6 md:mb-8">Past Interviews</h1>
      
      @if(history().length === 0) {
      <div class="text-center py-8 sm:py-12 md:py-20 px-3 sm:px-4">
        <div class="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
          <i class="fas fa-history text-xl sm:text-2xl md:text-4xl text-gray-400"></i>
        </div>
        <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-black mb-1 sm:mb-2">No Past Interviews</h2>
        <p class="text-gray-600 max-w-md mx-auto text-xs sm:text-sm md:text-base px-2">
          Your interview history will appear here once you complete your first session.
        </p>
      </div>
      } @else {
      <div class="grid gap-3 sm:gap-4 md:gap-6">
        @for(session of history(); track session.id) {
        <div class="glass-card p-3 sm:p-4 md:p-6 rounded-2xl border border-black/5 hover:border-black/10 transition-all">
          <div class="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm sm:text-base md:text-xl font-bold text-black mb-0.5 sm:mb-1">{{ session.config.primaryTechnology || 'Technical Interview' }}</h3>
              <p class="text-[10px] sm:text-xs sm:text-sm text-gray-600">
                <i class="far fa-calendar-alt mr-1 sm:mr-2"></i>{{ session.date | date:'medium' }}
                <span class="mx-1 sm:mx-2">•</span>
                <i class="fas fa-clock mr-1 sm:mr-2"></i>{{ session.config.interviewDuration }} min
              </p>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <div class="text-right">
                <div class="text-xl sm:text-2xl md:text-3xl font-bold text-black">{{ session.overallScore || 0 }}</div>
                <div class="text-[8px] sm:text-[10px] md:text-xs text-gray-500 uppercase font-bold">Score</div>
              </div>
              <button (click)="viewReport(session.id)"
                class="px-3 sm:px-4 md:px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px]">
                View Report
              </button>
            </div>
          </div>
          <p class="text-gray-600 text-[10px] sm:text-xs sm:text-sm leading-relaxed border-t border-black/5 pt-2 sm:pt-3 md:pt-4">
            {{ session.overallFeedback || 'No detailed feedback recorded.' }}
          </p>
        </div>
        }
      </div>
      }
    </div>
  `
})
export class DashboardHistoryComponent {
  stateService = inject(StateService);
  history = this.stateService.history;
  router = inject(Router);

  viewReport(sessionId: string) {
    this.stateService.loadSession(sessionId);
    this.router.navigate(['/report']);
  }
}
