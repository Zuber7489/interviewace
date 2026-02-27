import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard-help',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="h-full bg-slate-50 overflow-y-auto">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <!-- Header Section -->
        <div class="mb-10 text-center sm:text-left">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Help & Support</h1>
          <p class="mt-3 text-lg text-gray-600 max-w-2xl">
            Need assistance or have feedback? We're here to help. Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Contact Form -->
          <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
            <!-- Decorative background element -->
            <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent rounded-full opacity-50 blur-xl"></div>
            
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i class="fas fa-envelope text-black"></i>
              Send us a Message
            </h2>
            
            <form action="https://formspree.io/f/xwvnzpvd" method="POST" class="space-y-6 relative z-10">
              
              <!-- Email Input -->
              <div>
                <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                  Your email address
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-at text-gray-400"></i>
                  </div>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required
                    placeholder="you@example.com"
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                  >
                </div>
              </div>

              <!-- Message Input -->
              <div>
                <label for="message" class="block text-sm font-semibold text-gray-700 mb-2">
                  How can we help you?
                </label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="5"
                  required
                  placeholder="Describe your issue, ask a question, or share your feedback..."
                  class="block w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 resize-y"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <div class="pt-2">
                <button 
                  type="submit" 
                  class="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all transform active:scale-95 shadow-md">
                  <span>Send Message</span>
                  <i class="fas fa-paper-plane text-sm"></i>
                </button>
              </div>
              
            </form>
          </div>

          <!-- Quick Links / Info Sidebar -->
          <div class="space-y-6">
            <div class="bg-black text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
              <!-- Decorative circles -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-8 translate-y-8"></div>
              
              <h3 class="text-lg font-bold mb-4 relative z-10 border-b border-white/20 pb-3">Quick Contact Info</h3>
              
              <div class="space-y-4 relative z-10 text-gray-300">
                <div class="flex items-start gap-3">
                  <i class="fas fa-clock mt-1 text-white/70"></i>
                  <div>
                    <strong class="block text-white text-sm">Response Time</strong>
                    <span class="text-sm">Usually within 24-48 hours</span>
                  </div>
                </div>
                
                <div class="flex items-start gap-3">
                  <i class="fas fa-life-ring mt-1 text-white/70"></i>
                  <div>
                    <strong class="block text-white text-sm">Support Hours</strong>
                    <span class="text-sm">Monday - Friday<br>9:00 AM - 6:00 PM (IST)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- FAQ Teaser -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <i class="fas fa-lightbulb text-yellow-500"></i>
                Pro Tip
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                When describing an issue, please include details like what you were trying to do and what happened instead. This helps us resolve your problem faster!
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class DashboardHelpComponent {
}
