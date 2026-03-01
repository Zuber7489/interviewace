
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-wrapper">

      <!-- ─── Minimal Header ─── -->
      <div class="header-section text-center mb-4 sm:mb-8 mt-4">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">{{ timeGreeting() }}, {{ auth.currentUser()?.name?.split(' ')?.[0] || 'User' }} 👋</h1>
        
        <button routerLink="/dashboard/interviews" class="start-btn inline-flex items-center justify-center gap-2 bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto">
          <i class="fa-solid fa-bolt text-yellow-400"></i>
          Start Interview
        </button>
        <p class="text-gray-500 text-xs sm:text-sm mt-3">Start your first interview to track progress.</p>
      </div>

      <!-- ─── Minimal Stats ─── -->
      <div class="stats-minimal-grid">
        <!-- Avg Score -->
        <div class="stat-minimal-card">
          <p class="stat-label">AVG SCORE</p>
          <div class="stat-value">{{ averageScore() > 0 ? (averageScore() | number:'1.0-0') + '%' : '—' }}</div>
        </div>

        <!-- Interviews -->
        <div class="stat-minimal-card">
          <p class="stat-label">Interviews</p>
          <div class="stat-value">{{ auth.currentUser()?.interviewsCount || 0 }} <span class="text-gray-400 text-lg font-medium">/ {{ auth.currentUser()?.maxInterviews ?? (auth.currentUser()?.subscription === 'pro' ? 10 : 2) }}</span></div>
          <div class="usage-bar-track mt-2 sm:mt-3">
            <div class="usage-bar-fill" [style.width]="usagePercentage() + '%'"></div>
          </div>
        </div>

        <!-- Plan -->
        <div class="stat-minimal-card cursor-pointer hover:border-gray-300 transition-colors" routerLink="/dashboard/settings">
          <p class="stat-label">Plan</p>
          <div class="stat-value flex items-center gap-2">
            <i class="fa-solid fa-crown text-yellow-500 text-base" *ngIf="auth.currentUser()?.subscription === 'pro'"></i>
            {{ auth.currentUser()?.subscription === 'pro' ? 'Pro Member' : 'Free Plan' }}
          </div>
        </div>
      </div>

      <!-- ─── Recent Activity ─── -->
      <div class="activity-minimal">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-base sm:text-lg font-bold text-gray-900">Recent Sessions</h2>
          <a *ngIf="recentInterviews().length > 0" routerLink="/dashboard/history" class="text-xs sm:text-sm font-semibold text-gray-500 hover:text-black transition-colors">View All</a>
        </div>
        
        <div class="activity-list" *ngIf="recentInterviews().length > 0">
          <div *ngFor="let item of recentInterviews()" class="activity-row">
            <div class="flex-1 min-w-0 pr-2">
              <h4 class="font-bold text-sm text-gray-900 truncate">{{ item.config.primaryTechnology }} Interview</h4>
              <p class="text-xs text-gray-500 mt-0.5">{{ item.startTime | date:'MMM d, y' }}</p>
            </div>
            <div class="font-bold text-sm sm:text-base pr-4" [class.text-green-600]="(item.overallScore || 0) >= 70" [class.text-orange-500]="(item.overallScore || 0) < 70 && item.overallScore">{{ item.overallScore ? item.overallScore + '%' : '—' }}</div>
            <button (click)="viewReport(item.id)" class="text-xs bg-gray-100/80 hover:bg-gray-200 text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors flex-shrink-0">Report</button>
          </div>
        </div>

        <div class="text-center py-10 sm:py-12 text-gray-400 text-sm italic" *ngIf="recentInterviews().length === 0">
          — You haven't started any interview yet —
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      padding: 2rem 1.5rem;
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }
    
    .stats-minimal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    
    .stat-minimal-card {
      background: #fff;
      border: 1.5px solid #f0f0f0;
      border-radius: 20px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.015);
    }
    
    .stat-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 0.75rem;
    }
    
    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #111;
      line-height: 1.2;
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    
    .usage-bar-track {
      width: 100%; height: 5px; background: #f0f0f0; border-radius: 10px; overflow: hidden;
    }
    
    .usage-bar-fill {
      height: 100%; background: #111; border-radius: 10px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .activity-minimal {
      background: #fff;
      border: 1.5px solid #f0f0f0;
      border-radius: 24px;
      padding: 1.75rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.015);
    }
    
    .activity-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 0; border-bottom: 1.5px solid #f9f9f9;
    }
    
    .activity-row:last-child { border-bottom: none; padding-bottom: 0.25rem; }
    
    @media (max-width: 640px) {
      .dashboard-wrapper { padding: 1.5rem 1rem; gap: 2rem; }
      .stats-minimal-grid { grid-template-columns: 1fr; gap: 1rem; }
      .stat-minimal-card { padding: 1.5rem; border-radius: 16px; }
      .activity-minimal { padding: 1.25rem; border-radius: 16px; }
      .activity-row { padding: 1rem 0; }
    }
  `]
})
export class DashboardHomeComponent {
  auth = inject(AuthService);
  state = inject(StateService);
  private router = inject(Router);

  recentInterviews = computed(() => this.state.history().slice(0, 5));

  averageScore = computed(() => {
    const list = this.state.history()
      .filter(s => s.overallScore !== undefined)
      .slice(0, 5);
    if (!list.length) return 0;
    return list.reduce((a, c) => a + (c.overallScore || 0), 0) / list.length;
  });

  usagePercentage = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return 0;
    const max = user.maxInterviews ?? (user.subscription === 'pro' ? 10 : 2);
    return Math.min(((user.interviewsCount || 0) / max) * 100, 100);
  });

  timeGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  viewReport(sessionId: string) {
    this.state.loadSession(sessionId);
    this.router.navigate(['/report']);
  }
}
