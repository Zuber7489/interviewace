import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-legal-footer',
  imports: [RouterLink],
  template: `
    <footer class="border-t border-black/5 bg-white pt-10 pb-6 mt-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-10">
          <!-- Brand -->
          <div class="col-span-2 sm:col-span-1">
            <a routerLink="/" class="flex items-center gap-2 mb-3">
              <i class="fas fa-brain text-black text-lg"></i>
              <span class="font-bold text-black text-base">ScoreMyInterview</span>
            </a>
            <p class="text-gray-500 text-xs leading-relaxed">AI-powered mock interviews for ambitious developers.</p>
          </div>
          
          <!-- Product -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Product</h4>
            <ul class="space-y-2">
              <li><a routerLink="/" fragment="pricing" class="text-sm text-gray-600 hover:text-black transition-colors">Pricing</a></li>
              <li><a routerLink="/about" class="text-sm text-gray-600 hover:text-black transition-colors">About</a></li>
              <li><a routerLink="/contact" class="text-sm text-gray-600 hover:text-black transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <!-- Legal -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Legal</h4>
            <ul class="space-y-2">
              <li><a routerLink="/privacy-policy" class="text-sm text-gray-600 hover:text-black transition-colors">Privacy Policy</a></li>
              <li><a routerLink="/terms-of-service" class="text-sm text-gray-600 hover:text-black transition-colors">Terms of Service</a></li>
              <li><a routerLink="/cookie-policy" class="text-sm text-gray-600 hover:text-black transition-colors">Cookie Policy</a></li>
              <li><a routerLink="/refund-policy" class="text-sm text-gray-600 hover:text-black transition-colors">Refund Policy</a></li>
            </ul>
          </div>
          
          <!-- Account -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Account</h4>
            <ul class="space-y-2">
              <li><a routerLink="/login" class="text-sm text-gray-600 hover:text-black transition-colors">Log In</a></li>
              <li><a routerLink="/signup" class="text-sm text-gray-600 hover:text-black transition-colors">Sign Up Free</a></li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-black/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-xs text-gray-400">&copy; 2026 ScoreMyInterview. All rights reserved. &nbsp;|&nbsp; Made with 🔥 by <span class="text-black font-bold">Zuber</span> &mdash; The OG Angular Developer.</p>
          <div class="flex items-center gap-3">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span class="text-xs text-gray-400">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class LegalFooterComponent { }
