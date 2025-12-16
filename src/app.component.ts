import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './services/state.service';
import { SetupComponent } from './components/setup/setup.component';
import { InterviewComponent } from './components/interview/interview.component';
import { ReportComponent } from './components/report/report.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // FIX: Removed empty styleUrls array.
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SetupComponent, InterviewComponent, ReportComponent]
})
export class AppComponent {
  stateService = inject(StateService);
  currentView = this.stateService.currentView;
}