import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-privacy-policy',
    imports: [RouterLink],
    template: `
    <div class="min-h-screen flex flex-col font-sans bg-white">
      <!-- Navbar -->
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
        <!-- Header -->
        <div class="mb-10 sm:mb-14">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
            <i class="fas fa-shield-alt"></i> Legal Document
          </div>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-3">Privacy Policy</h1>
          <p class="text-gray-500 text-sm">Last updated: February 26, 2026</p>
        </div>

        <div class="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">1. Introduction</h2>
            <p class="text-sm sm:text-base">Welcome to <strong>ScoreMyInterview</strong> ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered mock interview platform.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">2. Information We Collect</h2>
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-gray-50 border border-black/5">
                <h3 class="font-bold text-black mb-2">Personal Information</h3>
                <ul class="space-y-1 text-sm sm:text-base list-disc list-inside text-gray-600">
                  <li>Name and email address (upon registration)</li>
                  <li>Profile information and account preferences</li>
                  <li>Payment information (processed securely via Stripe, not stored by us)</li>
                </ul>
              </div>
              <div class="p-4 rounded-xl bg-gray-50 border border-black/5">
                <h3 class="font-bold text-black mb-2">Usage & Interview Data</h3>
                <ul class="space-y-1 text-sm sm:text-base list-disc list-inside text-gray-600">
                  <li>Audio recordings during mock interviews (processed transiently, not permanently stored)</li>
                  <li>Resume content uploaded for interview tailoring</li>
                  <li>Interview scores, feedback, and session history</li>
                  <li>App usage patterns and feature engagement</li>
                </ul>
              </div>
              <div class="p-4 rounded-xl bg-gray-50 border border-black/5">
                <h3 class="font-bold text-black mb-2">Technical Data</h3>
                <ul class="space-y-1 text-sm sm:text-base list-disc list-inside text-gray-600">
                  <li>IP address, browser type, and device information</li>
                  <li>Cookies and session tokens</li>
                  <li>Log data and error reports</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">3. How We Use Your Information</h2>
            <ul class="space-y-2 text-sm sm:text-base">
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-black mt-1 flex-shrink-0"></i> To provide and personalize your AI mock interview experience</li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-black mt-1 flex-shrink-0"></i> To generate tailored questions from your resume and stated skills</li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-black mt-1 flex-shrink-0"></i> To process payments and manage your subscription tier</li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-black mt-1 flex-shrink-0"></i> To improve our AI models and platform quality</li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-black mt-1 flex-shrink-0"></i> To send transactional emails and product updates (you may opt out anytime)</li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-black mt-1 flex-shrink-0"></i> To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">4. AI & Third-Party Services</h2>
            <p class="text-sm sm:text-base mb-3">Our platform uses Google's Gemini AI API to power interview questions and feedback. Your interview conversations are sent to Google's API for processing. Google's privacy policy applies to this processing. We do not sell your data to third parties.</p>
            <p class="text-sm sm:text-base">We use Firebase (Google) for authentication and data storage, and Stripe for payment processing.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">5. Data Retention</h2>
            <p class="text-sm sm:text-base">We retain your account and interview history data as long as your account is active. You may request deletion of your data at any time by contacting us at <a href="mailto:privacy@scoremyinterview.com" class="underline text-black hover:text-gray-700">privacy@scoremyinterview.com</a>. We will process deletion requests within 30 days.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">6. Your Rights</h2>
            <p class="text-sm sm:text-base mb-3">Depending on your location, you may have rights under GDPR, CCPA, or Indian IT law, including:</p>
            <ul class="space-y-2 text-sm sm:text-base list-disc list-inside text-gray-600">
              <li>Right to access your personal data</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to request data deletion</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">7. Security</h2>
            <p class="text-sm sm:text-base">We implement industry-standard security measures including encryption in transit (HTTPS/TLS), secure authentication via Firebase, and regular security audits. However, no system is 100% secure, and we encourage you to use strong, unique passwords.</p>
          </section>

          <section>
            <h2 class="text-xl sm:text-2xl font-bold text-black mb-3">8. Contact Us</h2>
            <p class="text-sm sm:text-base">If you have any questions about this Privacy Policy, please contact us at:</p>
            <div class="mt-3 p-4 rounded-xl bg-gray-50 border border-black/5 text-sm sm:text-base">
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
export class PrivacyPolicyComponent { }
