import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-dashboard-history',
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-black mb-8">Past Interviews</h1>
      
      @if(history().length === 0) {
      <div class="text-center py-20">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-history text-4xl text-gray-400"></i>
        </div>
        <h2 class="text-2xl font-bold text-black mb-2">No Past Interviews</h2>
        <p class="text-gray-600 max-w-md mx-auto">
          Your interview history will appear here once you complete your first session.
        </p>
      </div>
      } @else {
      <div class="grid gap-6">
        @for(session of history(); track session.id) {
        <div class="glass-card p-6 rounded-2xl border border-black/5 hover:border-black/10 transition-all">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-bold text-black mb-1">{{ session.config.primaryTechnology || 'Technical Interview' }}</h3>
              <p class="text-sm text-gray-600">
                <i class="far fa-calendar-alt mr-2"></i>{{ session.date | date:'medium' }}
                <span class="mx-2">•</span>
                <i class="fas fa-clock mr-2"></i>{{ session.config.interviewDuration }} min
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-3xl font-bold text-black">{{ session.overallScore || 0 }}</div>
                <div class="text-xs text-gray-500 uppercase font-bold">Score</div>
              </div>
              <button (click)="viewReport(session.id)"
                class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                View Report
              </button>
            </div>
          </div>
          <p class="text-gray-600 text-sm leading-relaxed border-t border-black/5 pt-4">
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
