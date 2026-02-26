import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from './legal-footer.component';

@Component({
  selector: 'app-cookie-policy',
  imports: [RouterLink, LegalFooterComponent],
  template: `
    <div class="min-h-screen flex flex-col font-sans bg-white">
      <nav class="sticky top-0 z-50 px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center border-b border-black/10 backdrop-blur-md bg-white/80">
        <a routerLink="/" class="flex items-center gap-2 group">
          <i class="fas fa-brain text-black text-xl group-hover:scale-110 transition-transform duration-300"></i>
          <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">ScoreMyInterview</span>
        </a>
        <a routerLink="/" class="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1">
          <i class="fas fa-arrow-left text-xs"></i> Back to Home
        </a>
      </nav>

      <main class="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div class="mb-10 sm:mb-14">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
            <i class="fas fa-cookie-bite"></i> Legal Document
          </div>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-3">Cookie Policy</h1>
          <p class="text-gray-500 text-sm">Last updated: February 26, 2026</p>
        </div>

        <div class="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">1. What Are Cookies?</h2>
            <p class="text-sm sm:text-base">Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your experience. Some cookies are essential for the site to function, while others are used for analytics or personalisation.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">2. How We Use Cookies</h2>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-gray-50 border border-black/5">
                <div class="flex items-center gap-2 mb-2">
                  <i class="fas fa-lock text-black"></i>
                  <h3 class="font-bold text-black text-sm">Essential Cookies</h3>
                </div>
                <p class="text-sm text-gray-600">Required for authentication and session management via Firebase. Cannot be disabled.</p>
              </div>
              <div class="p-4 rounded-xl bg-gray-50 border border-black/5">
                <div class="flex items-center gap-2 mb-2">
                  <i class="fas fa-chart-bar text-black"></i>
                  <h3 class="font-bold text-black text-sm">Analytics Cookies</h3>
                </div>
                <p class="text-sm text-gray-600">Help us understand how users interact with the platform (e.g., most-used features, page views). You may opt out.</p>
              </div>
              <div class="p-4 rounded-xl bg-gray-50 border border-black/5">
                <div class="flex items-center gap-2 mb-2">
                  <i class="fas fa-sliders-h text-black"></i>
                  <h3 class="font-bold text-black text-sm">Preference Cookies</h3>
                </div>
                <p class="text-sm text-gray-600">Remember your settings like language preference, default interview duration, and report generation toggle.</p>
              </div>
              <div class="p-4 rounded-xl bg-gray-50 border border-black/5">
                <div class="flex items-center gap-2 mb-2">
                  <i class="fas fa-credit-card text-black"></i>
                  <h3 class="font-bold text-black text-sm">Payment Cookies</h3>
                </div>
                <p class="text-sm text-gray-600">Set by Stripe during checkout for fraud prevention and secure payment processing.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">3. Third-Party Cookies</h2>
            <p class="text-sm sm:text-base mb-3">Our platform integrates with the following third-party services that may set their own cookies:</p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border border-black/10 rounded-xl overflow-hidden">
                <thead class="bg-black text-white">
                  <tr>
                    <th class="px-4 py-3 text-left font-semibold">Service</th>
                    <th class="px-4 py-3 text-left font-semibold">Purpose</th>
                    <th class="px-4 py-3 text-left font-semibold">Policy</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-black/5">
                  <tr class="bg-white hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium">Firebase (Google)</td>
                    <td class="px-4 py-3 text-gray-600">Authentication & Database</td>
                    <td class="px-4 py-3"><a href="https://firebase.google.com/support/privacy" target="_blank" class="underline text-black">View</a></td>
                  </tr>
                  <tr class="bg-white hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium">Google Gemini AI</td>
                    <td class="px-4 py-3 text-gray-600">AI Processing</td>
                    <td class="px-4 py-3"><a href="https://ai.google.dev/terms" target="_blank" class="underline text-black">View</a></td>
                  </tr>
                  <tr class="bg-white hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium">Stripe</td>
                    <td class="px-4 py-3 text-gray-600">Payment Processing</td>
                    <td class="px-4 py-3"><a href="https://stripe.com/privacy" target="_blank" class="underline text-black">View</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">4. Managing Cookies</h2>
            <p class="text-sm sm:text-base mb-3">You can manage or disable cookies through your browser settings. Note that disabling essential cookies may affect platform functionality. Most modern browsers allow you to:</p>
            <ul class="space-y-2 text-sm sm:text-base list-disc list-inside text-gray-600">
              <li>View cookies currently stored</li>
              <li>Block all or specific cookies</li>
              <li>Delete cookies upon closing the browser</li>
              <li>Browse in private/incognito mode</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">5. Contact</h2>
            <div class="p-4 rounded-xl bg-gray-50 border border-black/5 text-sm sm:text-base">
              <strong>ScoreMyInterview</strong><br>
              Email: <a href="mailto:privacy@scoremyinterview.com" class="underline text-black">privacy@scoremyinterview.com</a>
            </div>
          </section>

        </div>
      </main>

      <app-legal-footer />
    </div>
  `
})
export class CookiePolicyComponent { }
