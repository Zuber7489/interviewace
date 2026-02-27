import { Component } from '@angular/core';
import { LegalFooterComponent } from './legal-footer.component';
import { PublicNavbarComponent } from '../landing/public-navbar.component';

@Component({
  selector: 'app-terms-of-service',
  imports: [LegalFooterComponent, PublicNavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col font-sans bg-white">
      <app-public-navbar />

      <main class="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div class="mb-10 sm:mb-14">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
            <i class="fas fa-file-contract"></i> Legal Document
          </div>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-3">Terms of Service</h1>
          <p class="text-gray-500 text-sm">Last updated: February 26, 2026</p>
        </div>

        <div class="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">1. Acceptance of Terms</h2>
            <p class="text-sm sm:text-base">By accessing or using ScoreMyInterview ("Service", "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service. These Terms constitute a legally binding agreement between you and ScoreMyInterview.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">2. Description of Service</h2>
            <p class="text-sm sm:text-base">ScoreMyInterview is an AI-powered mock interview platform that helps users prepare for technical job interviews. The platform provides real-time voice-based AI interviews, resume analysis, performance scoring, and detailed feedback using Google Gemini AI technology.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">3. User Accounts</h2>
            <ul class="space-y-3 text-sm sm:text-base">
              <li class="flex items-start gap-2"><i class="fas fa-circle text-black text-[6px] mt-2 flex-shrink-0"></i> You must be at least 13 years old to use this Service.</li>
              <li class="flex items-start gap-2"><i class="fas fa-circle text-black text-[6px] mt-2 flex-shrink-0"></i> You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li class="flex items-start gap-2"><i class="fas fa-circle text-black text-[6px] mt-2 flex-shrink-0"></i> You are responsible for all activity that occurs under your account.</li>
              <li class="flex items-start gap-2"><i class="fas fa-circle text-black text-[6px] mt-2 flex-shrink-0"></i> You must provide accurate and complete registration information.</li>
              <li class="flex items-start gap-2"><i class="fas fa-circle text-black text-[6px] mt-2 flex-shrink-0"></i> We reserve the right to terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">4. Subscription Plans & Billing</h2>
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-gray-50 border border-black/5">
                <h3 class="font-bold text-black mb-2">Free Plan</h3>
                <p class="text-sm text-gray-600">Includes up to 2 mock interviews per month. No payment required. Features are limited as described on our pricing page.</p>
              </div>
              <div class="p-4 rounded-xl bg-gray-50 border border-black/5">
                <h3 class="font-bold text-black mb-2">Pro Plan (₹999/month)</h3>
                <p class="text-sm text-gray-600">Provides unlimited mock interviews, advanced AI analysis, resume tailoring tips, and priority support. Billed monthly. Cancel anytime.</p>
              </div>
              <div class="p-4 rounded-xl bg-gray-50 border border-black/5">
                <h3 class="font-bold text-black mb-2">Pro Pack</h3>
                <p class="text-sm text-gray-600">₹200 for 10 mock interviews. No monthly subscription. You may purchase additional packs at any time. Each pack is valid until all interviews are used.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">5. Acceptable Use Policy</h2>
            <p class="text-sm sm:text-base mb-3">You agree NOT to:</p>
            <ul class="space-y-2 text-sm sm:text-base list-disc list-inside text-gray-600">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to reverse engineer, scrape, or clone the service</li>
              <li>Share your account credentials with others</li>
              <li>Upload malicious files or attempt to compromise our systems</li>
              <li>Use automated tools to interact with the platform</li>
              <li>Resell access to the platform without explicit written permission</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">6. AI-Generated Content Disclaimer</h2>
            <p class="text-sm sm:text-base">Interview questions, feedback, and scores are generated by AI (Google Gemini). While we strive for high quality, AI outputs may occasionally be inaccurate, biased, or incomplete. ScoreMyInterview does not guarantee that using our platform will result in a job offer or interview success. Use our feedback as one of many tools in your preparation journey.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">7. Intellectual Property</h2>
            <p class="text-sm sm:text-base">All platform content, design, logos, and software are owned by ScoreMyInterview. You retain ownership of your uploaded resume content. By uploading, you grant us a limited, non-exclusive license to process your resume solely for the purpose of providing the service.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">8. Limitation of Liability</h2>
            <p class="text-sm sm:text-base">To the maximum extent permitted by law, ScoreMyInterview shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total cumulative liability to you shall not exceed the amount you paid us in the last 3 months.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">9. Termination</h2>
            <p class="text-sm sm:text-base">Either party may terminate this agreement at any time. Upon termination, your access to the platform will cease. We may retain your data as required by law or our retention policy. You may request data deletion per our Privacy Policy.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">10. Governing Law</h2>
            <p class="text-sm sm:text-base">These Terms shall be governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of courts in India.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">11. Contact</h2>
            <div class="p-4 rounded-xl bg-gray-50 border border-black/5 text-sm sm:text-base">
              <strong>ScoreMyInterview</strong><br>
              Email: <a href="mailto:legal@scoremyinterview.com" class="underline text-black">legal@scoremyinterview.com</a>
            </div>
          </section>

        </div>
      </main>

      <app-legal-footer />
    </div>
  `
})
export class TermsOfServiceComponent { }
