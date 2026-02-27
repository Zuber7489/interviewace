import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LegalFooterComponent } from './legal-footer.component';
import { PublicNavbarComponent } from '../landing/public-navbar.component';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, CommonModule, LegalFooterComponent, PublicNavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col font-sans bg-white">
      <app-public-navbar />

      <main class="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <!-- Header -->
        <div class="text-center mb-12 sm:mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
            <i class="fas fa-envelope"></i> Get In Touch
          </div>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-3">Contact Us</h1>
          <p class="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">Have a question, feedback, or need enterprise pricing? We'd love to hear from you.</p>
        </div>

        <div class="max-w-2xl mx-auto space-y-8">
          <!-- Contact Form -->
          <div class="glass-card p-6 sm:p-8 rounded-2xl border border-black/5 shadow-sm">
            <h2 class="text-lg sm:text-xl font-bold text-black mb-6">Send a Message</h2>
            
            @if(submitted()) {
              <div class="text-center py-10">
                <div class="text-5xl mb-4">✅</div>
                <h3 class="font-bold text-black text-lg mb-2">Message Received!</h3>
                <p class="text-gray-600 text-sm">We typically respond within 1–2 business days. Check your inbox!</p>
              </div>
            } @else {
              <form (ngSubmit)="submitForm()" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input type="text" [(ngModel)]="name" name="name" required placeholder="Your name"
                    class="w-full border border-black/10 rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition-all">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <input type="email" [(ngModel)]="email" name="email" required placeholder="you@example.com"
                    class="w-full border border-black/10 rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition-all">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Subject</label>
                  <select [(ngModel)]="subject" name="subject"
                    class="w-full border border-black/10 rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition-all">
                    <option value="">Select a topic...</option>
                    <option>General Inquiry</option>
                    <option>Bug / Technical Issue</option>
                    <option>Feature Request</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Message</label>
                  <textarea [(ngModel)]="message" name="message" required rows="5" placeholder="Tell us more..."
                    class="w-full border border-black/10 rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition-all resize-none"></textarea>
                </div>
                <button type="submit" [disabled]="sending()"
                  class="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  @if(sending()) {
                    <i class="fas fa-spinner fa-spin"></i> Sending...
                  } @else {
                    <i class="fas fa-paper-plane"></i> Send Message
                  }
                </button>
              </form>
            }
          </div>

          <!-- Response Time -->
          <div class="p-5 sm:p-6 rounded-2xl border border-black/[0.03] bg-black/[0.01] transition-all">
            <div class="flex items-center justify-center gap-4 text-center">
              <div>
                <h3 class="font-bold text-black text-sm mb-1 uppercase tracking-tight">Response Time</h3>
                <p class="text-gray-500 text-xs sm:text-sm">
                  We typically respond within <strong class="text-black">1–2 business days</strong>. 
                  For urgent issues, mention <span class="font-bold text-black">"URGENT"</span> in your subject line.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <app-legal-footer />
    </div>
  `
})
export class ContactComponent {
  name = '';
  email = '';
  subject = '';
  message = '';
  sending = signal(false);
  submitted = signal(false);

  async submitForm() {
    if (!this.name || !this.email || !this.message) return;
    this.sending.set(true);

    try {
      const response = await fetch('https://formspree.io/f/mqakppov', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          subject: this.subject,
          message: this.message
        })
      });

      if (response.ok) {
        this.submitted.set(true);
      } else {
        alert('Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Contact error:', error);
      alert('Network error. Please try again.');
    } finally {
      this.sending.set(false);
    }
  }
}
