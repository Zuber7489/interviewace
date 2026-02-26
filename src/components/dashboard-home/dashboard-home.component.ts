
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
    <div class="p-6 md:p-8 space-y-8 animate-fade-in relative z-10 overflow-y-auto max-h-screen custom-scrollbar">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-black tracking-tight font-heading">
            Welcome back, {{ auth.currentUser()?.name }}! 👋
          </h1>
          <p class="text-gray-600 mt-1">Here is your interview preparation summary.</p>
        </div>
        <button routerLink="/dashboard/interviews" 
                class="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 group shadow-lg hover:shadow-xl w-fit">
          <i class="fa-solid fa-bolt text-yellow-400 group-hover:scale-110 transition-transform"></i>
          Start New Interview
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Interviews Count -->
        <div class="glass p-6 rounded-2xl border border-black/5 hover:border-black/10 transition-all group shadow-sm bg-white/40">
          <div class="flex items-center gap-4 mb-3">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:rotate-6 transition-transform">
              <i class="fa-solid fa-microphone-lines text-xl"></i>
            </div>
            <span class="text-sm font-medium text-gray-500">Usage Status</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold">{{ auth.currentUser()?.interviewsCount || 0 }}</span>
            <span class="text-gray-400 text-sm">of {{ auth.currentUser()?.subscription === 'pro' ? '∞' : (auth.currentUser()?.maxInterviews || 2) }}</span>
          </div>
          <div class="mt-4 w-full bg-black/5 h-2 rounded-full overflow-hidden">
            <div class="h-full bg-blue-600 transition-all duration-1000" 
                 [style.width.%]="usagePercentage()"></div>
          </div>
        </div>

        <!-- Average Score -->
        <div class="glass p-6 rounded-2xl border border-black/5 hover:border-black/10 transition-all group shadow-sm bg-white/40">
          <div class="flex items-center gap-4 mb-3">
            <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 group-hover:rotate-6 transition-transform">
              <i class="fa-solid fa-chart-line text-xl"></i>
            </div>
            <span class="text-sm font-medium text-gray-500">Avg. Score</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold">{{ averageScore() | number:'1.0-0' }}%</span>
            <span class="text-gray-400 text-sm text-[10px]" *ngIf="averageScore() > 0">last 5 sessions</span>
          </div>
          <p class="text-[10px] text-gray-400 mt-4 uppercase tracking-wider font-semibold">Trend: Steady 📈</p>
        </div>

        <!-- Subscription -->
        <div class="glass p-6 rounded-2xl border border-black/5 hover:border-black/10 transition-all group shadow-sm bg-white/40">
          <div class="flex items-center gap-4 mb-3">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:rotate-6 transition-transform">
              <i class="fa-solid fa-shield-halved text-xl"></i>
            </div>
            <span class="text-sm font-medium text-gray-500">Plan</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-sm">
              {{ auth.currentUser()?.subscription || 'Free' }}
            </span>
          </div>
          <p class="text-[10px] text-gray-400 mt-4 cursor-pointer hover:text-black transition-colors" routerLink="/dashboard/settings">
            Change subscription →
          </p>
        </div>

        <!-- Last Active -->
        <div class="glass p-6 rounded-2xl border border-black/5 hover:border-black/10 transition-all group shadow-sm bg-white/40">
          <div class="flex items-center gap-4 mb-3">
            <div class="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:rotate-6 transition-transform">
              <i class="fa-solid fa-clock-rotate-left text-xl"></i>
            </div>
            <span class="text-sm font-medium text-gray-500">Last Session</span>
          </div>
          <div class="text-lg font-bold truncate">
            {{ lastInterviewDate() }}
          </div>
          <p class="text-[10px] text-gray-400 mt-4 uppercase tracking-wider font-semibold">Activity log</p>
        </div>
      </div>

      <!-- Content Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <!-- History Section -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between px-2">
            <h3 class="text-xl font-bold text-black font-heading">Recent Activities</h3>
            <a routerLink="/dashboard/history" class="text-sm text-gray-500 hover:text-black font-medium transition-colors">See all history</a>
          </div>
          
          <div class="space-y-3">
            <div *ngFor="let item of recentInterviews()" 
                 class="glass bg-white/60 p-4 rounded-xl border border-black/5 flex items-center justify-between hover:border-black/10 hover:bg-white/80 transition-all shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                   <i class="fa-solid fa-scroll text-sm"></i>
                </div>
                <div>
                   <h4 class="font-bold text-black text-sm">{{ item.config.primaryTechnology }} Interview</h4>
                   <p class="text-[10px] text-gray-400">ID: #{{ item.id.substring(0, 8) }} • {{ item.startTime | date:'short' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                 <div class="text-right mr-2">
                    <span class="text-xs font-bold block" [class.text-green-600]="(item.overallScore || 0) >= 70" [class.text-orange-500]="(item.overallScore || 0) < 70">
                       {{ item.overallScore ? item.overallScore + '%' : 'N/A' }}
                    </span>
                 </div>
                 <button (click)="viewReport(item.id)" 
                         class="px-3 py-1.5 bg-black text-white rounded-lg text-[10px] font-bold hover:bg-gray-800 transition-colors">
                   Report
                 </button>
              </div>
            </div>

            <div *ngIf="recentInterviews().length === 0" class="text-center py-20 glass rounded-2xl border-dashed border-2 border-black/5 bg-white/20">
               <i class="fa-solid fa-inbox text-4xl text-gray-200 mb-4 block"></i>
               <p class="text-gray-400 font-medium">No interview history yet.</p>
               <button routerLink="/dashboard/interviews" class="mt-4 px-6 py-2 bg-black text-white rounded-xl text-xs font-bold">Start Now</button>
            </div>
          </div>
        </div>

        <!-- Right Side: Tips & Upgrades -->
        <div class="space-y-6">
          <div class="glass p-6 rounded-2xl bg-black text-white relative overflow-hidden group shadow-xl">
             <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
             <h4 class="text-xl font-heading font-bold mb-4 relative z-10 flex items-center gap-2">
               <i class="fa-solid fa-wand-magic-sparkles text-purple-400"></i>
               SaaS Tip
             </h4>
             <p class="text-xs text-gray-400 leading-relaxed italic mb-6 relative z-10">
               "Sophia loves it when you explain your logic out loud. Even if you're stuck, talk through your thought process to earn 'Reasoning' points."
             </p>
             <button routerLink="/dashboard/settings" class="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg border border-white/10 transition-colors relative z-10">
               Read Sophia Handbook
             </button>
          </div>

          <div class="glass p-6 rounded-2xl border border-yellow-500/20 bg-yellow-50/20 group hover:border-yellow-500/40 transition-all">
             <div class="flex items-center gap-3 mb-3">
                <i class="fa-solid fa-crown text-yellow-600 text-lg"></i>
                <h4 class="font-bold text-gray-800">Go Pro?</h4>
             </div>
             <p class="text-[11px] text-gray-500 leading-relaxed mb-4">
               Get unlimited interviews, specialized technology roles, and advanced behavioral analysis.
             </p>
             <button routerLink="/dashboard/settings" class="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-[10px] font-bold rounded-lg transition-all shadow-md shadow-yellow-500/10">
               Unlock Everything
             </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass {
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.05);
      border-radius: 10px;
    }
  `]
})
export class DashboardHomeComponent {
  auth = inject(AuthService);
  state = inject(StateService);
  private router = inject(Router);

  recentInterviews = computed(() => {
    return this.state.history().slice(0, 4);
  });

  averageScore = computed(() => {
    const historicalReports = this.state.history()
      .filter(s => s.overallScore !== undefined)
      .slice(0, 5);

    if (historicalReports.length === 0) return 0;

    const sum = historicalReports.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
    return sum / historicalReports.length;
  });

  usagePercentage = computed(() => {
    const user = this.auth.currentUser();
    if (!user || user.subscription === 'pro') return 100;
    return ((user.interviewsCount || 0) / (user.maxInterviews || 2)) * 100;
  });

  lastInterviewDate = computed(() => {
    const history = this.state.history();
    if (history.length === 0) return 'Beginner';

    const lastDate = new Date(history[0].startTime);
    const now = new Date();

    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Active Today';
    if (diffDays === 1) return 'Active Yesterday';
    return `${diffDays} days ago`;
  });

  viewReport(sessionId: string) {
    this.state.loadSession(sessionId);
    this.router.navigate(['/report']);
  }
}
