import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { StateService } from './services/state.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet]
})
export class AppComponent implements OnInit {
  stateService = inject(StateService);
  toastService = inject(ToastService);

  ngOnInit() {
    // Load any active session from localStorage on app startup
    this.stateService.loadActiveSession();
  }
}