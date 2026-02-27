import { Component } from '@angular/core';
import { LegalFooterComponent } from './legal-footer.component';
import { PublicNavbarComponent } from '../landing/public-navbar.component';

@Component({
  selector: 'app-refund-policy',
  imports: [LegalFooterComponent, PublicNavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col font-sans bg-white">
      <app-public-navbar />

      <main class="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div class="mb-10 sm:mb-14">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
            <i class="fas fa-undo-alt"></i> Legal Document
          </div>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-3">Refund Policy</h1>
          <p class="text-gray-500 text-sm">Last updated: February 26, 2026</p>
        </div>

        <div class="space-y-10 text-gray-700 leading-relaxed">

          <section class="p-5 sm:p-6 rounded-2xl bg-black text-white">
            <h2 class="text-lg sm:text-xl font-bold mb-2">Our Promise to You</h2>
            <p class="text-sm sm:text-base text-gray-300">We stand behind our product. If you're not satisfied, we offer a straightforward refund process. No complicated procedures, no endless support tickets.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">1. Free Plan</h2>
            <p class="text-sm sm:text-base">There is no charge for the Free plan. No refunds are applicable for free tier usage.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">2. Pro Plan — 7-Day Money-Back Guarantee</h2>
            <p class="text-sm sm:text-base mb-4">If you are not satisfied with your Pro subscription, you may request a full refund within <strong class="text-black">7 days</strong> of your initial purchase. This is a one-time guarantee for new subscribers.</p>
            <div class="p-4 rounded-xl bg-gray-50 border border-black/5 space-y-3">
              <div class="flex items-start gap-3">
                <i class="fas fa-check-circle text-black mt-1 text-lg flex-shrink-0"></i>
                <div>
                  <div class="font-bold text-black text-sm">Eligible for Refund</div>
                  <p class="text-gray-600 text-sm">First-time Pro subscribers within 7 days of purchase.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <i class="fas fa-times-circle text-gray-400 mt-1 text-lg flex-shrink-0"></i>
                <div>
                  <div class="font-bold text-black text-sm">Not Eligible for Refund</div>
                  <p class="text-gray-600 text-sm">Refund requests after 7 days, subsequent subscription renewals, or accounts found to have violated our Terms of Service.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">3. Cancellation Policy</h2>
            <p class="text-sm sm:text-base">You may cancel your Pro subscription at any time from your account settings. Upon cancellation:</p>
            <ul class="mt-3 space-y-2 text-sm sm:text-base list-disc list-inside text-gray-600">
              <li>Your Pro access continues until the end of the current billing period.</li>
              <li>You will not be charged for the next billing cycle.</li>
              <li>Your interview history and data are retained for 90 days after cancellation.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">4. Enterprise Plans</h2>
            <p class="text-sm sm:text-base">Refund terms for Enterprise plans are governed by the individual enterprise agreement signed at the time of purchase. Please contact your account manager for details.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">5. How to Request a Refund</h2>
            <ol class="space-y-3 text-sm sm:text-base">
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Email us at <a href="mailto:billing@scoremyinterview.com" class="underline text-black font-medium">billing@scoremyinterview.com</a> with the subject "Refund Request".</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Include your registered email, the date of purchase, and a brief reason for the refund.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>We will review your request and process approved refunds within <strong>5-7 business days</strong> to your original payment method.</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">6. Contact</h2>
            <div class="p-4 rounded-xl bg-gray-50 border border-black/5 text-sm sm:text-base">
              <strong>Billing Team — ScoreMyInterview</strong><br>
              Email: <a href="mailto:billing@scoremyinterview.com" class="underline text-black">billing@scoremyinterview.com</a>
            </div>
          </section>

        </div>
      </main>

      <app-legal-footer />
    </div>
  `
})
export class RefundPolicyComponent { }
