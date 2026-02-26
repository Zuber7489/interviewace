import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { InterviewSession } from '../models';
import { AuthService } from './auth.service';
import { getDatabase, ref, get, set, child } from 'firebase/database';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '../firebase.config';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private authService = inject(AuthService);
  private readonly ACTIVE_SESSION_KEY = 'interviewace_active_session';
  private readonly REPORT_GENERATION_KEY = 'interviewace_report_generation';

  // Current active interview session (in-memory)
  activeSession = signal<InterviewSession | null>(null);

  // Instead of computing from local storage, we maintain a standalone signal that triggers fetched data.
  historyList = signal<InterviewSession[]>([]);
  history = computed(() => this.historyList());

  constructor() {
    // Whenever the user changes, reload history from Firebase
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.fetchHistoryFromFirebase(user.id);
      } else {
        this.historyList.set([]);
      }
    });
  }

  resetActiveSession() {
    this.activeSession.set(null);
    localStorage.removeItem(this.ACTIVE_SESSION_KEY);
  }

  // Report Generation Preference (kept in LocalStorage since it's device-specific generally, or could be moved similarly)
  enableReports = signal<boolean>(this.loadReportGenerationPreference());

  private loadReportGenerationPreference(): boolean {
    try {
      const value = localStorage.getItem(this.REPORT_GENERATION_KEY);
      return value === 'true';
    } catch (e) {
      console.error('Failed to load report generation preference:', e);
      return false;
    }
  }

  toggleReportGeneration() {
    const newValue = !this.enableReports();
    this.enableReports.set(newValue);
    try {
      localStorage.setItem(this.REPORT_GENERATION_KEY, newValue.toString());
    } catch (e) {
      console.error('Failed to save report generation preference:', e);
    }
  }

  async fetchHistoryFromFirebase(userId: string) {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${userId}/history`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        // history nodes are stored by ID under history object
        const parsedHistory: InterviewSession[] = Object.values(data);
        parsedHistory.sort((a, b) => b.startTime - a.startTime);
        this.historyList.set(parsedHistory);
      } else {
        this.historyList.set([]);
      }
    } catch (err) {
      console.error("Failed fetching history from FB", err);
    }
  }

  startInterview(session: InterviewSession) {
    this.activeSession.set(session);
    // Keep temporary active session in local storage for crash recovery
    this.saveActiveSession(session);
  }

  async finishInterview() {
    const session = this.activeSession();
    const user = this.authService.currentUser();

    if (session && user) {
      try {
        // Firebase crashes if anything is 'undefined'. We must clean the session safely.
        const cleanSession = JSON.parse(JSON.stringify(session));

        // Save to Firebase under users/[uid]/history/[session_id]
        const sessionRef = ref(database, `users/${user.id}/history/${session.id}`);
        await set(sessionRef, cleanSession);

        // Update local list
        const currentList = this.historyList();
        const existingIndex = currentList.findIndex(s => s.id === session.id);
        const newList = [...currentList];
        if (existingIndex >= 0) {
          newList[existingIndex] = session;
        } else {
          newList.unshift(session);
        }
        newList.sort((a, b) => b.startTime - a.startTime);
        this.historyList.set(newList);

        // Clear active session storage
        localStorage.removeItem(this.ACTIVE_SESSION_KEY);
      } catch (e) {
        console.error('Failed to save interview to history:', e);
      }
    }
  }

  loadSession(sessionId: string) {
    const session = this.historyList().find((s: InterviewSession) => s.id === sessionId);
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
}
