import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="min-h-screen bg-white flex">
      <app-sidebar></app-sidebar>
      <main class="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 lg:ml-64 transition-all duration-300">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class DashboardLayoutComponent { }
