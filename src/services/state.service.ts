import { Injectable, signal, inject, computed } from '@angular/core';
import { InterviewSession } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private authService = inject(AuthService);
  private readonly HISTORY_KEY = 'interviewace_history';

  // Current active interview session (in-memory)
  activeSession = signal<InterviewSession | null>(null);

  // History signal derived from local storage + user
  history = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    const allHistory = this.getAllHistory();
    return allHistory.filter((s: InterviewSession) => s.userId === user.id).sort((a: InterviewSession, b: InterviewSession) => b.startTime - a.startTime);
  });

  startInterview(session: InterviewSession) {
    this.activeSession.set(session);
  }

  finishInterview() {
    const session = this.activeSession();
    if (session && this.authService.currentUser()) {
      // Save to history
      const allHistory = this.getAllHistory();
      allHistory.push(session);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(allHistory));

      // Clear active session (or keep it for the report view until they navigate away)
      // We'll keep it for now so ReportComponent can read it.
    }
  }

  private getAllHistory(): InterviewSession[] {
    const data = localStorage.getItem(this.HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  }
}
