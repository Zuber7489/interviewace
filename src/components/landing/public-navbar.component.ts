
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-public-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <nav class="glass sticky top-0 z-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-black/10 backdrop-blur-md bg-white/80 supports-[backdrop-filter]:bg-white/40">
      <button class="flex items-center gap-1.5 sm:gap-2 group focus:outline-none" routerLink="/">
         <img src="assets/favicon.png" alt="ScoreMyInterview" class="w-6 h-6 sm:w-8 sm:h-8 object-contain group-hover:scale-110 transition-transform duration-300">
         <span class="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 tracking-tight">ScoreMyInterview</span>
      </button>
      <div class="flex items-center gap-2 sm:gap-4 md:gap-6">
        <a routerLink="/about" class="hidden sm:block text-sm font-medium text-gray-600 hover:text-black transition-colors">About</a>
        <a routerLink="/contact" class="hidden sm:block text-sm font-medium text-gray-600 hover:text-black transition-colors">Contact</a>
        <a routerLink="/signup" class="bg-black hover:bg-gray-800 text-white text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 min-w-[88px] min-h-[44px] flex items-center justify-center">Get Started</a>
      </div>
    </nav>
  `
})
export class PublicNavbarComponent { }
