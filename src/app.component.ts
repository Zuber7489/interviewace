import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError, RouterOutlet } from '@angular/router';
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

  /** true while a route navigation is in progress */
  navigating = signal(false);

  ngOnInit() {
    // Load any active session from localStorage on app startup
    this.stateService.loadActiveSession();

    // Show/hide progress bar + scroll to top on route events
    this.router.events
      .pipe(filter(e =>
        e instanceof NavigationStart ||
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      ))
      .subscribe(e => {
        if (e instanceof NavigationStart) {
          this.navigating.set(true);
        } else {
          this.navigating.set(false);
          if (e instanceof NavigationEnd) {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }
      });
  }
}