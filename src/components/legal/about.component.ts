import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from './legal-footer.component';

@Component({
    selector: 'app-about',
    imports: [RouterLink, LegalFooterComponent],
    template: `
    <div class="min-h-screen flex flex-col font-sans bg-white">
      <nav class="sticky top-0 z-50 px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center border-b border-black/10 backdrop-blur-md bg-white/80">
        <a routerLink="/" class="flex items-center gap-2 group">
          <i class="fas fa-brain text-black text-xl group-hover:scale-110 transition-transform duration-300"></i>
          <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">ScoreMyInterview</span>
        </a>
        <a routerLink="/signup" class="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full font-medium transition-all">
          Get Started Free
        </a>
      </nav>

      <main class="flex-grow">
        <!-- Hero -->
        <section class="py-16 sm:py-20 md:py-28 px-4 sm:px-6 text-center relative overflow-hidden">
          <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-black/5 rounded-full blur-[80px] -z-10 animate-pulse"></div>
          <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-black/5 rounded-full blur-[80px] -z-10 animate-pulse" style="animation-delay: 1s;"></div>
          <div class="max-w-4xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full text-xs font-semibold text-gray-600 uppercase tracking-wide mb-6">
              <i class="fas fa-info-circle"></i> About Us
            </div>
            <h1 class="text-3xl sm:text-4xl md:text-6xl font-extrabold text-black mb-6 leading-tight">
              We help people land their <br class="hidden sm:block">
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-600 to-gray-800">dream tech jobs</span>
            </h1>
            <p class="text-gray-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              ScoreMyInterview was built by engineers who struggled through technical interviews — and decided to fix the problem with AI.
            </p>
          </div>
        </section>

        <!-- Mission -->
        <section class="py-14 sm:py-16 px-4 sm:px-6 bg-black text-white">
          <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6">Our Mission</h2>
            <p class="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              To democratize interview preparation. Whether you're a fresh CS graduate or a seasoned developer switching stacks — everyone deserves access to high-quality, personalized interview coaching without paying ₹5,000/hour for a human coach.
            </p>
          </div>
        </section>

        <!-- How it works -->
        <section class="py-14 sm:py-16 px-4 sm:px-6">
          <div class="max-w-5xl mx-auto">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black text-center mb-12">How It Works</h2>
            <div class="grid sm:grid-cols-3 gap-6">
              <div class="text-center p-6 rounded-2xl border border-black/5 hover:border-black/20 hover:shadow-xl transition-all hover:-translate-y-1">
                <div class="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📄</div>
                <h3 class="font-bold text-black text-lg mb-2">Upload Resume</h3>
                <p class="text-gray-600 text-sm">Upload your PDF resume. Our AI reads your experience, skills, and goals to craft hyper-relevant questions.</p>
              </div>
              <div class="text-center p-6 rounded-2xl border border-black/5 hover:border-black/20 hover:shadow-xl transition-all hover:-translate-y-1">
                <div class="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🎙️</div>
                <h3 class="font-bold text-black text-lg mb-2">Interview Live</h3>
                <p class="text-gray-600 text-sm">Speak directly to your AI interviewer. It listens, understands your answers, and follows up intelligently in real time.</p>
              </div>
              <div class="text-center p-6 rounded-2xl border border-black/5 hover:border-black/20 hover:shadow-xl transition-all hover:-translate-y-1">
                <div class="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📊</div>
                <h3 class="font-bold text-black text-lg mb-2">Get Feedback</h3>
                <p class="text-gray-600 text-sm">Receive a detailed score, question-by-question analysis, and actionable tips to improve before your real interview.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Tech Stack -->
        <section class="py-14 sm:py-16 px-4 sm:px-6 bg-gray-50">
          <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-2xl sm:text-3xl font-extrabold text-black mb-4">Powered By</h2>
            <p class="text-gray-600 text-sm sm:text-base mb-10">We use the best AI and cloud infrastructure so you can focus on what matters — your preparation.</p>
            <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <div class="px-5 py-3 bg-white rounded-xl border border-black/10 text-sm font-bold text-black shadow-sm">🤖 Google Gemini 2.0 Flash</div>
              <div class="px-5 py-3 bg-white rounded-xl border border-black/10 text-sm font-bold text-black shadow-sm">🔥 Firebase</div>
              <div class="px-5 py-3 bg-white rounded-xl border border-black/10 text-sm font-bold text-black shadow-sm">🌊 Web Speech API</div>
              <div class="px-5 py-3 bg-white rounded-xl border border-black/10 text-sm font-bold text-black shadow-sm">🅰️ Angular 21</div>
              <div class="px-5 py-3 bg-white rounded-xl border border-black/10 text-sm font-bold text-black shadow-sm">💳 Stripe</div>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="py-16 sm:py-20 px-4 sm:px-6 text-center">
          <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-4">Ready to ace your next interview?</h2>
            <p class="text-gray-600 text-sm sm:text-base mb-8">Join thousands of developers who are using AI to prepare smarter, not harder.</p>
            <a routerLink="/signup" class="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all shadow-2xl hover:shadow-black/20 hover:-translate-y-0.5">
              Start for Free <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </section>
      </main>

      <app-legal-footer />
    </div>
  `
})
export class AboutComponent { }
