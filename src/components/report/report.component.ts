import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-report',
  // FIX: Removed `standalone: true` as it is default in Angular v20+.
  imports: [CommonModule],
  templateUrl: './report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportComponent {
  stateService = inject(StateService);
  router = inject(Router);
  session = this.stateService.activeSession;

  overallScore = computed(() => this.session()?.overallScore || 0);

  scoreColorClass = computed(() => {
    const score = this.overallScore();
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  });

  scoreRingClass = computed(() => {
    const score = this.overallScore();
    if (score >= 80) return 'stroke-green-400';
    if (score >= 50) return 'stroke-yellow-400';
    return 'stroke-red-400';
  });

  startNew() {
    this.router.navigate(['/dashboard']);
  }
}