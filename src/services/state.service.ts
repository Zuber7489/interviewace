import { Injectable, signal, inject, computed } from '@angular/core';
import { InterviewSession } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private authService = inject(AuthService);
  private readonly HISTORY_KEY = 'interviewace_history';
  private readonly ACTIVE_SESSION_KEY = 'interviewace_active_session';

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
    // Save active session to localStorage for recovery
    this.saveActiveSession(session);
  }

  finishInterview() {
    const session = this.activeSession();
    if (session && this.authService.currentUser()) {
      try {
        // Save to history
        const allHistory = this.getAllHistory();
        
        // Check if session already exists to avoid duplicates
        const existingIndex = allHistory.findIndex((s: InterviewSession) => s.id === session.id);
        if (existingIndex >= 0) {
          // Update existing session
          allHistory[existingIndex] = session;
        } else {
          // Add new session
          allHistory.push(session);
        }
        
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(allHistory));

        // Clear active session storage
        localStorage.removeItem(this.ACTIVE_SESSION_KEY);

        // Clear active session (or keep it for the report view until they navigate away)
        // We'll keep it for now so ReportComponent can read it.
      } catch (e) {
        console.error('Failed to save interview to history:', e);
      }
    }
  }

  loadSession(sessionId: string) {
    const allHistory = this.getAllHistory();
    const session = allHistory.find((s: InterviewSession) => s.id === sessionId);
    if (session) {
      this.activeSession.set(session);
    }
  }

  loadActiveSession() {
    try {
      const data = localStorage.getItem(this.ACTIVE_SESSION_KEY);
      if (data) {
        const session = JSON.parse(data) as InterviewSession;
        const user = this.authService.currentUser();
        // Only restore if it belongs to current user and hasn't ended
        if (user && session.userId === user.id && !session.endTime) {
          this.activeSession.set(session);
          return true;
        }
      }
    } catch (e) {
      console.error('Failed to load active session:', e);
    }
    return false;
  }

  private saveActiveSession(session: InterviewSession) {
    try {
      localStorage.setItem(this.ACTIVE_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save active session:', e);
    }
  }

  private getAllHistory(): InterviewSession[] {
    const data = localStorage.getItem(this.HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  }
}
