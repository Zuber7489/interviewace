import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-dashboard-history',
  imports: [CommonModule],
  template: `
    <div class="history-wrapper">

      <!-- Header -->
      <div class="history-header">
        <div>
          <h1 class="history-title">Past Interviews</h1>
          <p class="history-sub">{{ history().length }} session{{ history().length !== 1 ? 's' : '' }} recorded</p>
        </div>
      </div>

      <!-- Empty State -->
      @if(history().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-history"></i>
          </div>
          <h2 class="empty-title">No Past Interviews</h2>
          <p class="empty-sub">Your interview history will appear here once you complete your first session.</p>
        </div>
      }

      <!-- Session List -->
      @else {
        <div class="session-list">
          @for(session of history(); track session.id) {
            <div class="session-card" [class.deleting]="deletingId() === session.id">

              <!-- Card Top Row -->
              <div class="card-top">
                <div class="card-left">
                  <div class="tech-icon-wrap">
                    <i class="fa-solid fa-code"></i>
                  </div>
                  <div class="card-meta">
                    <h3 class="card-title">{{ session.config.primaryTechnology || 'Technical Interview' }}</h3>
                    <p class="card-date">
                      <i class="far fa-calendar-alt"></i>
                      {{ session.startTime | date:'MMM d, y · h:mm a' }}
                      <span class="mx-2 opacity-30">•</span>
                      <i class="fas fa-clock"></i>
                      {{ session.config.interviewDuration }} min
                    </p>
                  </div>
                </div>

                <div class="card-right">
                  <!-- Score Badge -->
                  <div class="score-wrap">
                    <div class="score-num"
                         [class.score-green]="(session.overallScore || 0) >= 70"
                         [class.score-orange]="(session.overallScore || 0) < 70 && session.overallScore">
                      {{ session.overallScore || '—' }}
                    </div>
                    <div class="score-label">Score</div>
                  </div>

                  <!-- Actions -->
                  <div class="card-actions">
                    <button (click)="viewReport(session.id)" class="btn-report">
                      <i class="fa-solid fa-file-lines"></i>
                      Report
                    </button>
                    <button (click)="confirmDelete(session.id)" class="btn-delete"
                            [disabled]="deletingId() === session.id"
                            title="Delete this session">
                      <i class="fa-solid" [class.fa-trash]="deletingId() !== session.id" [class.fa-spinner]="deletingId() === session.id" [class.fa-spin]="deletingId() === session.id"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Feedback -->
              <p class="card-feedback">
                {{ session.overallFeedback || 'No detailed feedback recorded for this session.' }}
              </p>
            </div>
          }
        </div>
      }

      <!-- ── Delete Confirm Modal ── -->
      @if(showModal()) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-icon">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 class="modal-title">Delete Interview?</h3>
            <p class="modal-desc">This session and its report will be permanently deleted. This action cannot be undone.</p>
            <div class="modal-actions">
              <button (click)="cancelDelete()" class="modal-cancel">Cancel</button>
              <button (click)="executeDelete()" class="modal-confirm">
                <i class="fa-solid fa-trash text-xs"></i>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .history-wrapper {
      padding: 2rem 2rem 4rem;
      max-width: 900px;
      margin: 0 auto;
    }

    /* Header */
    .history-header {
      display: flex; align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .history-title {
      font-size: 1.75rem; font-weight: 800;
      color: #000; margin: 0 0 4px;
    }
    .history-sub {
      font-size: 0.8rem; color: #aaa; margin: 0;
    }

    /* Empty */
    .empty-state {
      display: flex; flex-direction: column;
      align-items: center; text-align: center;
      padding: 5rem 1rem;
    }
    .empty-icon {
      width: 80px; height: 80px; border-radius: 22px;
      background: #f5f5f5; color: #ccc;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; margin-bottom: 1.25rem;
    }
    .empty-title { font-size: 1.2rem; font-weight: 700; color: #333; margin: 0 0 0.5rem; }
    .empty-sub   { font-size: 0.85rem; color: #aaa; max-width: 320px; margin: 0; }

    /* Session List */
    .session-list { display: flex; flex-direction: column; gap: 1rem; }

    .session-card {
      background: #fff;
      border: 1.5px solid #f0f0f0;
      border-radius: 20px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }
    .session-card:hover {
      border-color: #e0e0e0;
      box-shadow: 0 8px 30px rgba(0,0,0,0.06);
    }
    .session-card.deleting {
      opacity: 0.5;
      pointer-events: none;
      transform: scale(0.98);
    }

    /* Card Top */
    .card-top {
      display: flex; align-items: center;
      justify-content: space-between;
      gap: 1rem; margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .card-left {
      display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0;
    }
    .tech-icon-wrap {
      width: 44px; height: 44px; border-radius: 14px;
      background: #f5f5f5; color: #555;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; flex-shrink: 0;
    }
    .card-meta { min-width: 0; }
    .card-title {
      font-size: 1rem; font-weight: 700; color: #000;
      margin: 0 0 3px; white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
    }
    .card-date {
      font-size: 0.7rem; color: #aaa; margin: 0;
      display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
    }
    .card-date i { font-size: 0.65rem; }

    .card-right {
      display: flex; align-items: center; gap: 1rem; flex-shrink: 0;
    }

    /* Score */
    .score-wrap { text-align: center; }
    .score-num {
      font-size: 1.8rem; font-weight: 800; color: #ccc;
      line-height: 1;
    }
    .score-num.score-green  { color: #16a34a; }
    .score-num.score-orange { color: #ea580c; }
    .score-label {
      font-size: 0.6rem; font-weight: 700; color: #bbb;
      text-transform: uppercase; letter-spacing: 0.06em;
    }

    /* Actions */
    .card-actions { display: flex; gap: 0.5rem; align-items: center; }
    .btn-report {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 10px;
      background: #000; color: #fff;
      font-size: 0.75rem; font-weight: 700;
      border: none; cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-report:hover {
      background: #222;
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
    }
    .btn-delete {
      width: 38px; height: 38px; border-radius: 10px;
      background: #fff5f5; color: #ef4444;
      border: 1.5px solid #fee2e2;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .btn-delete:hover {
      background: #ef4444; color: #fff;
      border-color: #ef4444;
      box-shadow: 0 4px 12px rgba(239,68,68,0.3);
    }
    .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Feedback */
    .card-feedback {
      font-size: 0.8rem; color: #888; line-height: 1.7;
      border-top: 1.5px solid #f5f5f5;
      padding-top: 1rem; margin: 0;
    }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(6px);
      z-index: 9000;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
      animation: overlayIn 0.2s ease;
    }
    @keyframes overlayIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .modal-box {
      background: #fff;
      border-radius: 24px;
      padding: 2rem;
      width: 100%; max-width: 380px;
      text-align: center;
      box-shadow: 0 25px 60px rgba(0,0,0,0.2);
      animation: boxIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes boxIn {
      from { opacity: 0; transform: scale(0.9) translateY(10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .modal-icon {
      width: 60px; height: 60px; border-radius: 18px;
      background: #fff5f5; color: #ef4444;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; margin: 0 auto 1.25rem;
    }
    .modal-title { font-size: 1.2rem; font-weight: 800; color: #000; margin: 0 0 0.5rem; }
    .modal-desc  { font-size: 0.82rem; color: #888; line-height: 1.6; margin: 0 0 1.75rem; }
    .modal-actions { display: flex; gap: 0.75rem; }
    .modal-cancel {
      flex: 1; padding: 12px;
      background: #f5f5f5; color: #555;
      font-size: 0.85rem; font-weight: 700;
      border: none; border-radius: 12px;
      cursor: pointer; transition: 0.2s;
    }
    .modal-cancel:hover { background: #eee; }
    .modal-confirm {
      flex: 1; padding: 12px;
      background: #ef4444; color: #fff;
      font-size: 0.85rem; font-weight: 700;
      border: none; border-radius: 12px;
      cursor: pointer; transition: 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 7px;
    }
    .modal-confirm:hover {
      background: #dc2626;
      box-shadow: 0 4px 14px rgba(239,68,68,0.35);
    }

    /* Responsive */
    @media (max-width: 640px) {
      .history-wrapper { padding: 1.25rem 1rem 3rem; }
      .card-top { flex-direction: column; align-items: flex-start; }
      .card-right { width: 100%; justify-content: space-between; }
      .history-title { font-size: 1.4rem; }
    }
  `]
})
export class DashboardHistoryComponent {
  stateService = inject(StateService);
  history = this.stateService.history;
  router = inject(Router);

  deletingId = signal<string | null>(null);
  showModal = signal(false);
  pendingId = signal<string | null>(null);

  viewReport(sessionId: string) {
    this.stateService.loadSession(sessionId);
    this.router.navigate(['/report']);
  }

  confirmDelete(sessionId: string) {
    this.pendingId.set(sessionId);
    this.showModal.set(true);
  }

  cancelDelete() {
    this.showModal.set(false);
    this.pendingId.set(null);
  }

  async executeDelete() {
    const id = this.pendingId();
    if (!id) return;

    this.showModal.set(false);
    this.deletingId.set(id);

    try {
      await this.stateService.deleteSession(id);
    } catch {
      // silently handled in service
    } finally {
      this.deletingId.set(null);
      this.pendingId.set(null);
    }
  }
}
