
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

      <!-- ─── Hero Banner ─── -->
      <div class="hero-banner">
        <div class="hero-orb orb-1"></div>
        <div class="hero-orb orb-2"></div>
        <div class="hero-content">
          <div class="hero-text">
            <span class="greeting-badge">
              <i class="fa-solid fa-sun text-yellow-400"></i>
              {{ timeGreeting() }}
            </span>
            <h1 class="hero-title">{{ auth.currentUser()?.name || 'Interviewer' }} <span class="wave">👋</span></h1>
            <p class="hero-sub">Track your progress, review past sessions, and level up your interview game.</p>
          </div>
          <button routerLink="/dashboard/interviews" class="cta-btn">
            <span class="cta-icon"><i class="fa-solid fa-bolt"></i></span>
            Start Interview
            <i class="fa-solid fa-arrow-right text-xs opacity-60 ml-1"></i>
          </button>
        </div>
      </div>

      <!-- ─── Stats Row ─── -->
      <div class="stats-grid">

        <!-- Score Ring -->
        <div class="stat-card score-card">
          <div class="score-ring-wrap">
            <svg class="score-ring" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" class="ring-track"/>
              <circle cx="50" cy="50" r="40" class="ring-fill"
                [style.stroke-dashoffset]="scoreOffset()"/>
            </svg>
            <div class="score-inner">
              <span class="score-val">{{ averageScore() | number:'1.0-0' }}<span class="score-pct">%</span></span>
            </div>
          </div>
          <div class="stat-info">
            <p class="stat-title">Avg. Score</p>
            <p class="stat-sub">Last 5 sessions</p>
            <div class="trend-badge" [class.trend-good]="averageScore() >= 70" [class.trend-warn]="averageScore() < 70 && averageScore() > 0">
              <i class="fa-solid" [class.fa-arrow-trend-up]="averageScore() >= 70" [class.fa-arrow-trend-down]="averageScore() < 70 && averageScore() > 0" [class.fa-minus]="averageScore() === 0"></i>
              {{ averageScore() >= 70 ? 'Great' : (averageScore() > 0 ? 'Needs Work' : 'No Data') }}
            </div>
          </div>
        </div>

        <!-- Usage -->
        <div class="stat-card">
          <div class="stat-icon-wrap blue-icon">
            <i class="fa-solid fa-microphone-lines"></i>
          </div>
          <div class="stat-info">
            <p class="stat-title">Interviews Used</p>
            <div class="big-num">
              {{ auth.currentUser()?.interviewsCount || 0 }}
              <span class="big-num-sub">/ {{ auth.currentUser()?.subscription === 'pro' ? 10 : (auth.currentUser()?.maxInterviews || 2) }}</span>
            </div>
            <div class="usage-bar-track">
              <div class="usage-bar-fill" [style.width]="usagePercentage() + '%'"
                   [class.bar-danger]="usagePercentage() >= 80"></div>
            </div>
            <p class="stat-sub">{{ usagePercentage() < 100 ? (100 - usagePercentage() | number:'1.0-0') + '% remaining' : 'Limit reached' }}</p>
          </div>
        </div>

        <!-- Plan -->
        <div class="stat-card plan-card" routerLink="/dashboard/settings">
          <div class="stat-icon-wrap purple-icon">
            <i class="fa-solid" [class.fa-crown]="auth.currentUser()?.subscription === 'pro'" [class.fa-shield-halved]="auth.currentUser()?.subscription !== 'pro'"></i>
          </div>
          <div class="stat-info">
            <p class="stat-title">Current Plan</p>
            <div class="plan-badge" [class.plan-pro]="auth.currentUser()?.subscription === 'pro'">
              <i class="fa-solid fa-crown text-[10px]" *ngIf="auth.currentUser()?.subscription === 'pro'"></i>
              {{ auth.currentUser()?.subscription === 'pro' ? 'Pro Member' : 'Free Plan' }}
            </div>
            <p class="stat-sub mt-2">{{ auth.currentUser()?.subscription === 'pro' ? '10 interviews/pack' : 'Tap to buy →' }}</p>
          </div>
        </div>

        <!-- Last Session -->
        <div class="stat-card">
          <div class="stat-icon-wrap orange-icon">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </div>
          <div class="stat-info">
            <p class="stat-title">Last Session</p>
            <div class="big-num text-xl">{{ lastInterviewDate() }}</div>
            <div class="streak-dots">
              <span *ngFor="let d of streakDots()" class="dot" [class.dot-active]="d"></span>
            </div>
            <p class="stat-sub">7-day activity</p>
          </div>
        </div>

      </div>

      <!-- ─── Main Content ─── -->
      <div class="content-grid">

        <!-- Recent Activity -->
        <div class="activity-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Recent Activity</h2>
              <p class="section-sub">Your last {{ recentInterviews().length || 0 }} interview sessions</p>
            </div>
            <a routerLink="/dashboard/history" class="see-all-link">
              View all <i class="fa-solid fa-arrow-right text-xs"></i>
            </a>
          </div>

          <!-- Interview list -->
          <div class="activity-list" *ngIf="recentInterviews().length > 0">
            <div *ngFor="let item of recentInterviews(); let i = index"
                 class="activity-row"
                 [style.animation-delay]="(i * 80) + 'ms'">
              <div class="activity-rank">{{ i + 1 }}</div>
              <div class="activity-icon-wrap">
                <i class="fa-solid fa-code"></i>
              </div>
              <div class="activity-meta">
                <h4 class="activity-title">{{ item.config.primaryTechnology }} Interview</h4>
                <p class="activity-date">{{ item.startTime | date:'MMM d, y · h:mm a' }}</p>
              </div>
              <div class="activity-score-wrap">
                <div class="activity-score"
                     [class.score-high]="(item.overallScore || 0) >= 70"
                     [class.score-low]="(item.overallScore || 0) < 70 && item.overallScore">
                  {{ item.overallScore ? item.overallScore + '%' : '—' }}
                </div>
                <div class="score-mini-bar">
                  <div [style.width]="(item.overallScore || 0) + '%'"
                       [class.bar-green]="(item.overallScore||0) >= 70"
                       [class.bar-orange]="(item.overallScore||0) < 70"></div>
                </div>
              </div>
              <button (click)="viewReport(item.id)" class="report-btn">
                <i class="fa-solid fa-file-lines text-xs"></i>
                Report
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="recentInterviews().length === 0">
            <div class="empty-icon-wrap">
              <i class="fa-solid fa-microphone-slash"></i>
            </div>
            <h3 class="empty-title">No sessions yet</h3>
            <p class="empty-sub">Start your first mock interview and get AI-powered feedback instantly.</p>
            <button routerLink="/dashboard/interviews" class="empty-cta">
              <i class="fa-solid fa-bolt"></i> Start First Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Wrapper ── */
    .dashboard-wrapper {
      padding: 2rem 2rem 4rem;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* ── Hero ── */
    .hero-banner {
      background: #000;
      border-radius: 24px;
      padding: 2.5rem 2.5rem;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
    }
    .hero-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
    }
    .orb-1 {
      width: 260px; height: 260px;
      background: rgba(139, 92, 246, 0.35);
      top: -60px; right: -40px;
    }
    .orb-2 {
      width: 180px; height: 180px;
      background: rgba(234, 179, 8, 0.2);
      bottom: -50px; left: 30%;
    }
    .hero-content {
      position: relative; z-index: 1;
      display: flex; align-items: center;
      justify-content: space-between;
      width: 100%; gap: 1.5rem;
      flex-wrap: wrap;
    }
    .greeting-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.7);
      font-size: 0.72rem; font-weight: 600;
      padding: 4px 12px; border-radius: 100px;
      letter-spacing: 0.04em; margin-bottom: 0.75rem;
      text-transform: uppercase;
    }
    .hero-title {
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      font-weight: 800; color: #fff; line-height: 1.15;
      margin: 0 0 0.5rem;
    }
    .wave { display: inline-block; animation: wave 1.8s ease infinite; transform-origin: 70% 70%; }
    @keyframes wave {
      0%,100% { transform: rotate(0deg); }
      20% { transform: rotate(18deg); }
      40% { transform: rotate(-8deg); }
      60% { transform: rotate(14deg); }
      80% { transform: rotate(-4deg); }
    }
    .hero-sub {
      color: rgba(255,255,255,0.5); font-size: 0.9rem; margin: 0;
    }
    .cta-btn {
      display: inline-flex; align-items: center; gap: 10px;
      background: #fff; color: #000;
      font-weight: 800; font-size: 0.9rem;
      padding: 14px 28px; border-radius: 14px;
      border: none; cursor: pointer;
      transition: all 0.25s ease;
      white-space: nowrap; flex-shrink: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    }
    .cta-icon {
      width: 28px; height: 28px; border-radius: 8px;
      background: #000; color: #facc15;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem;
    }

    /* ── Stats Grid ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
    }
    .stat-card {
      background: #fff;
      border: 1.5px solid #f0f0f0;
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.85rem;
      transition: all 0.25s ease;
      cursor: default;
    }
    .stat-card:hover {
      border-color: #e0e0e0;
      box-shadow: 0 8px 30px rgba(0,0,0,0.06);
      transform: translateY(-2px);
    }
    .plan-card { cursor: pointer; }

    /* Score ring card */
    .score-card {
      flex-direction: row;
      align-items: center;
      gap: 1.25rem;
    }
    .score-ring-wrap {
      position: relative;
      width: 88px; height: 88px;
      flex-shrink: 0;
    }
    .score-ring {
      width: 100%; height: 100%;
      transform: rotate(-90deg);
      overflow: visible;
    }
    .ring-track {
      fill: none; stroke: #f0f0f0; stroke-width: 9;
    }
    .ring-fill {
      fill: none; stroke: #111; stroke-width: 9;
      stroke-linecap: round;
      stroke-dasharray: 251.2;
      transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .score-inner {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem; font-weight: 800; color: #000;
      line-height: 1;
    }
    .score-val {
      display: inline-flex; align-items: baseline; gap: 1px;
    }
    .score-pct {
      font-size: 0.65rem; font-weight: 700; color: #888;
    }

    /* Icon wraps */
    .stat-icon-wrap {
      width: 52px; height: 52px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; flex-shrink: 0;
    }
    .blue-icon   { background: #eff6ff; color: #2563eb; }
    .purple-icon { background: #f5f3ff; color: #7c3aed; }
    .orange-icon { background: #fff7ed; color: #ea580c; }

    .stat-info { flex: 1; min-width: 0; }
    .stat-title { font-size: 0.7rem; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 0.3rem; }
    .stat-sub   { font-size: 0.7rem; color: #bbb; margin: 0; }
    .big-num    { font-size: 1.7rem; font-weight: 800; color: #000; line-height: 1.1; margin-bottom: 0.4rem; }
    .big-num-sub { font-size: 0.85rem; font-weight: 500; color: #aaa; }

    .trend-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 100px;
      font-size: 0.65rem; font-weight: 700;
      background: #f0f0f0; color: #666;
      margin-top: 0.5rem;
    }
    .trend-good { background: #dcfce7; color: #16a34a; }
    .trend-warn { background: #fff7ed; color: #ea580c; }

    .usage-bar-track {
      width: 100%; background: #f0f0f0;
      border-radius: 100px; height: 6px;
      overflow: hidden; margin-bottom: 0.4rem;
    }
    .usage-bar-fill {
      height: 100%; background: #000;
      border-radius: 100px;
      transition: width 1s cubic-bezier(0.4,0,0.2,1);
    }
    .bar-danger { background: linear-gradient(90deg, #f97316, #ef4444); }

    .plan-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 12px; border-radius: 100px;
      font-size: 0.72rem; font-weight: 700;
      background: #111; color: #fff;
      margin-top: 0.3rem;
    }
    .plan-pro { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; }

    .streak-dots {
      display: flex; gap: 5px; margin-top: 0.5rem;
    }
    .dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #f0f0f0;
      transition: background 0.3s;
    }
    .dot-active { background: #000; }

    /* ── Content Grid ── */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    /* ── Activity Section ── */
    .activity-section {
      background: #fff;
      border: 1.5px solid #f0f0f0;
      border-radius: 20px;
      padding: 1.75rem;
    }
    .section-header {
      display: flex; align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.5rem; gap: 1rem;
    }
    .section-title {
      font-size: 1.15rem; font-weight: 800; color: #000; margin: 0 0 2px;
    }
    .section-sub { font-size: 0.72rem; color: #aaa; margin: 0; }
    .see-all-link {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.75rem; font-weight: 600; color: #666;
      text-decoration: none;
      transition: color 0.2s;
      white-space: nowrap;
      padding: 6px 12px; border-radius: 10px;
      border: 1.5px solid #f0f0f0;
    }
    .see-all-link:hover { color: #000; border-color: #ccc; }

    .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .activity-row {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.25rem;
      background: #fafafa;
      border: 1.5px solid #f5f5f5;
      border-radius: 14px;
      transition: all 0.2s ease;
      animation: rowIn 0.4s ease forwards;
      opacity: 0;
    }
    @keyframes rowIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .activity-row:hover {
      border-color: #e5e5e5;
      background: #fff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    }

    .activity-rank {
      width: 22px; height: 22px;
      border-radius: 6px; background: #f0f0f0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 800; color: #999;
      flex-shrink: 0;
    }
    .activity-icon-wrap {
      width: 40px; height: 40px; border-radius: 12px;
      background: #f0f0f0; color: #555;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; flex-shrink: 0;
    }
    .activity-meta { flex: 1; min-width: 0; }
    .activity-title { font-size: 0.85rem; font-weight: 700; color: #000; margin: 0 0 2px; }
    .activity-date  { font-size: 0.68rem; color: #aaa; margin: 0; }

    .activity-score-wrap { text-align: right; min-width: 60px; }
    .activity-score {
      font-size: 0.9rem; font-weight: 800; color: #999;
      margin-bottom: 4px;
    }
    .score-high { color: #16a34a; }
    .score-low  { color: #ea580c; }
    .score-mini-bar {
      width: 56px; height: 4px; background: #f0f0f0;
      border-radius: 100px; overflow: hidden; margin-left: auto;
    }
    .score-mini-bar div {
      height: 100%; border-radius: 100px;
      transition: width 0.8s ease;
    }
    .bar-green  { background: #16a34a; }
    .bar-orange { background: #ea580c; }

    .report-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 7px 14px; border-radius: 10px;
      background: #000; color: #fff;
      font-size: 0.7rem; font-weight: 700;
      border: none; cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .report-btn:hover {
      background: #222;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    /* Empty state */
    .empty-state {
      display: flex; flex-direction: column;
      align-items: center; text-align: center;
      padding: 3.5rem 1rem;
    }
    .empty-icon-wrap {
      width: 72px; height: 72px; border-radius: 20px;
      background: #f5f5f5; color: #ccc;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; margin-bottom: 1.25rem;
    }
    .empty-title { font-size: 1.05rem; font-weight: 700; color: #333; margin: 0 0 0.5rem; }
    .empty-sub   { font-size: 0.8rem; color: #aaa; margin: 0 0 1.5rem; max-width: 280px; }
    .empty-cta {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 22px; border-radius: 12px;
      background: #000; color: #fff;
      font-size: 0.8rem; font-weight: 700;
      border: none; cursor: pointer;
      transition: 0.2s;
    }
    .empty-cta:hover { background: #222; transform: translateY(-1px); }

    /* ── Right Column ── */
    .right-col { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Tip Card */
    .tip-card {
      background: #0a0a0a;
      border-radius: 20px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .tip-bg-glow {
      position: absolute;
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(139,92,246,0.3), transparent);
      top: -60px; right: -40px;
      pointer-events: none;
    }
    .tip-header {
      display: flex; align-items: center; gap: 0.75rem;
      margin-bottom: 1rem; position: relative; z-index: 1;
    }
    .tip-icon-wrap {
      width: 40px; height: 40px; border-radius: 12px;
      background: rgba(139,92,246,0.2);
      color: #a78bfa;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
    }
    .tip-title { font-size: 0.9rem; font-weight: 700; color: #fff; margin: 0; }
    .tip-sub   { font-size: 0.65rem; color: rgba(255,255,255,0.4); margin: 0; }
    .tip-quote {
      font-size: 0.8rem; color: rgba(255,255,255,0.6);
      line-height: 1.7; font-style: italic;
      border-left: 3px solid rgba(139,92,246,0.5);
      margin: 0 0 1rem; padding-left: 0.75rem;
      position: relative; z-index: 1;
    }
    .tip-tags {
      display: flex; gap: 6px; flex-wrap: wrap;
      position: relative; z-index: 1;
    }
    .tip-tag {
      padding: 3px 10px; border-radius: 100px;
      font-size: 0.65rem; font-weight: 600;
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.4);
      border: 1px solid rgba(255,255,255,0.08);
    }

    /* Upgrade Card */
    .upgrade-card {
      background: linear-gradient(145deg, #fffbeb, #fef9c3);
      border: 1.5px solid #fde68a;
      border-radius: 20px;
      padding: 1.5rem;
      cursor: pointer;
      position: relative; overflow: hidden;
      transition: all 0.3s ease;
    }
    .upgrade-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(251,191,36,0.2);
    }
    .upgrade-shimmer {
      position: absolute; inset: 0;
      background: linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%);
      background-size: 200% 100%;
      animation: shimmer 2.5s infinite;
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .upgrade-crown {
      width: 44px; height: 44px; border-radius: 14px;
      background: #fbbf24; color: #78350f;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; margin-bottom: 0.75rem;
      position: relative; z-index: 1;
    }
    .upgrade-title {
      font-size: 1rem; font-weight: 800; color: #78350f;
      margin: 0 0 0.75rem; position: relative; z-index: 1;
    }
    .upgrade-list {
      list-style: none; padding: 0; margin: 0 0 1.25rem;
      display: flex; flex-direction: column; gap: 6px;
      position: relative; z-index: 1;
    }
    .upgrade-list li {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.78rem; color: #92400e; font-weight: 600;
    }
    .upgrade-btn {
      width: 100%; padding: 10px;
      background: #f59e0b; color: #000;
      font-size: 0.8rem; font-weight: 800;
      border: none; border-radius: 12px;
      cursor: pointer; transition: 0.2s;
      position: relative; z-index: 1;
    }
    .upgrade-btn:hover { background: #d97706; }

    /* Pro Card */
    .pro-card {
      background: #000; border-radius: 20px;
      padding: 1.5rem; text-align: center;
      position: relative; overflow: hidden;
    }
    .pro-glow {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at center top, rgba(251,191,36,0.15), transparent 70%);
    }
    .pro-badge-icon {
      width: 52px; height: 52px; border-radius: 16px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: #78350f; font-size: 1.3rem;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 0.75rem;
      position: relative; z-index: 1;
    }
    .pro-title { font-size: 1rem; font-weight: 800; color: #fff; margin: 0 0 0.4rem; z-index: 1; position: relative; }
    .pro-sub   { font-size: 0.72rem; color: rgba(255,255,255,0.4); margin: 0 0 1rem; z-index: 1; position: relative; }
    .pro-perks {
      display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;
      position: relative; z-index: 1;
    }
    .pro-perks span {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 100px;
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.6);
      font-size: 0.65rem; font-weight: 600;
      border: 1px solid rgba(255,255,255,0.08);
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .dashboard-wrapper { padding: 1.25rem 1rem 3rem; gap: 1.25rem; }
      .hero-banner { padding: 1.75rem 1.5rem; }
      .hero-title { font-size: 1.5rem; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .activity-section { padding: 1.25rem; }
      .content-grid { gap: 1.25rem; }
    }
    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr; }
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

  // stroke-dasharray = 2πr = 2*π*40 ≈ 251.2
  scoreOffset = computed(() => 251.2 - (251.2 * this.averageScore()) / 100);

  usagePercentage = computed(() => {
    const user = this.auth.currentUser();
    if (!user || user.subscription === 'pro') return 100;
    return Math.min(((user.interviewsCount || 0) / (user.maxInterviews || 2)) * 100, 100);
  });

  lastInterviewDate = computed(() => {
    const h = this.state.history();
    if (!h.length) return 'No sessions';
    const diff = Math.floor((Date.now() - new Date(h[0].startTime).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  });

  /** Simple 7-dot activity based on history timestamps */
  streakDots = computed(() => {
    const h = this.state.history();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toDateString();
    });
    return days.map(d => h.some(s => new Date(s.startTime).toDateString() === d));
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
