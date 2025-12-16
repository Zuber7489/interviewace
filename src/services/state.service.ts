
import { Injectable, signal } from '@angular/core';
import { AppView, InterviewSession } from '../models';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  currentView = signal<AppView>('setup');
  interviewSession = signal<InterviewSession | null>(null);

  startNewInterview() {
    this.interviewSession.set(null);
    this.currentView.set('setup');
  }

  startInterview(session: InterviewSession) {
    this.interviewSession.set(session);
    this.currentView.set('interview');
  }

  finishInterview() {
    this.currentView.set('report');
  }
}
