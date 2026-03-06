import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
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
  private router = inject(Router);

  ngOnInit() {
    // Load any active session from localStorage on app startup
    this.stateService.loadActiveSession();

    // Scroll to top on every route navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
  }
}