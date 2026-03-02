import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-not-found',
    imports: [RouterLink],
    template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 32px 32px;"></div>
      
      <div class="text-center relative z-10 max-w-lg">
        <!-- 404 Number -->
        <div class="relative mb-6">
          <span class="text-[10rem] sm:text-[14rem] font-black text-black/5 select-none leading-none block">404</span>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="bg-white rounded-2xl px-8 py-4 shadow-lg border border-black/5">
              <i class="fas fa-search text-4xl text-gray-300"></i>
            </div>
          </div>
        </div>

        <h1 class="text-2xl sm:text-3xl font-bold text-black mb-3">Page Not Found</h1>
        <p class="text-gray-500 text-sm sm:text-base mb-8 leading-relaxed">
          Looks like this page doesn't exist. Maybe it was moved, deleted, or the URL has a typo.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a routerLink="/dashboard"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-black/20">
            <i class="fas fa-home text-sm"></i>
            Go to Dashboard
          </a>
          <a routerLink="/"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 border border-black/20 text-gray-700 font-bold rounded-xl hover:bg-black/5 transition-all">
            <i class="fas fa-arrow-left text-sm"></i>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent { }
