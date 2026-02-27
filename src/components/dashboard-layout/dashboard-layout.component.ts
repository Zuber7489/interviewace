import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="h-screen bg-white flex overflow-hidden">
      <app-sidebar></app-sidebar>
      <main class="flex-1 overflow-y-auto pt-20 lg:pt-0 lg:ml-64 transition-all duration-300 no-scrollbar">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .no-scrollbar {
      scrollbar-width: none;        /* Firefox */
      -ms-overflow-style: none;     /* IE/Edge */
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;                /* Chrome, Safari */
    }
  `]
})
export class DashboardLayoutComponent { }
