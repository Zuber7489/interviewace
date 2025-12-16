import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { InterviewConfig, InterviewSession } from '../../models';

@Component({
  selector: 'app-setup',
  // FIX: Removed `standalone: true` as it is default in Angular v20+.
  imports: [CommonModule, FormsModule],
  templateUrl: './setup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupComponent {
  stateService = inject(StateService);

  setupMethod = signal<'form' | 'resume'>('form');
  
  // Form signals
  primaryTechnology = signal('Angular');
  secondarySkills = signal('RxJS, NgRx, TypeScript');
  yearsOfExperience = signal(2);
  interviewDuration = signal(10);
  
  // Resume signal
  resumeText = signal('');

  isLoading = signal(false);
  error = signal<string | null>(null);

  startInterview() {
    this.isLoading.set(true);
    this.error.set(null);

    const config: InterviewConfig = {
      primaryTechnology: this.primaryTechnology(),
      secondarySkills: this.secondarySkills(),
      yearsOfExperience: this.yearsOfExperience(),
      interviewDuration: this.interviewDuration(),
      resumeText: this.setupMethod() === 'resume' ? this.resumeText() : undefined,
    };
    
    const session: InterviewSession = {
      config,
      chatHistory: [],
      evaluatedQuestions: [],
      startTime: Date.now(),
    };
    
    this.stateService.startInterview(session);
    // The view will switch, and this component will be destroyed.
    // The loading state is now handled by the InterviewComponent.
  }
}