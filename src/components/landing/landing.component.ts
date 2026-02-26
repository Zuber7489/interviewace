
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal/legal-footer.component';

@Component({
    selector: 'app-landing',
    imports: [CommonModule, RouterLink, LegalFooterComponent],
    template: `
    <div class="min-h-screen flex flex-col font-sans selection:bg-black/30">
      <!-- Navbar -->
      <nav class="glass sticky top-0 z-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-black/10 backdrop-blur-md bg-white/80 supports-[backdrop-filter]:bg-white/40">
        <button class="flex items-center gap-1.5 sm:gap-2 group focus:outline-none" routerLink="/">
           <i class="fas fa-brain text-black text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300"></i>
           <span class="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 tracking-tight">ScoreMyInterview</span>
        </button>
        <div class="flex items-center gap-2 sm:gap-4 md:gap-6">
          <a routerLink="/about" class="hidden sm:block text-sm font-medium text-gray-600 hover:text-black transition-colors">About</a>
          <a routerLink="/contact" class="hidden sm:block text-sm font-medium text-gray-600 hover:text-black transition-colors">Contact</a>
          <a routerLink="/signup" class="bg-black hover:bg-gray-800 text-white text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 min-w-[88px] min-h-[44px] flex items-center justify-center">Get Started</a>
        </div>
      </nav>

      <!-- Hero Section -->
      <main class="flex-grow flex flex-col items-center justify-center text-center px-3 sm:px-4 py-12 sm:py-16 md:py-20 relative overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-black/10 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] -z-10 animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-black/10 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] -z-10 animate-pulse" style="animation-delay: 1s;"></div>

        <div class="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in relative z-10">
            <div class="inline-block glass px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-black/10 mb-3 sm:mb-4 hover:border-black/50 transition-colors cursor-default">
                <span class="text-black text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide uppercase">✨ AI-Powered Technical Interviews</span>
            </div>
            
            <h1 class="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-black leading-tight tracking-tight px-2">
                Master Your Next <br class="hidden sm:block">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-600 to-gray-800 animate-gradient-x">Technical Interview</span>
            </h1>
            
            <p class="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
                Practice with realistic, real-time AI interviewers. Upload your resume for a tailored experience, get instant feedback, and boost your confidence.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-6 sm:pt-8 w-full sm:w-auto">
                <a routerLink="/signup" class="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-black to-gray-700 rounded-full text-white font-bold text-sm sm:text-base md:text-lg overflow-hidden shadow-2xl transition-all hover:scale-105 hover:shadow-xl w-full sm:w-auto min-h-[44px]">
                    <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                    <span class="relative flex items-center justify-center">
                        Start Your Mock Interview <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </span>
                </a>
                <a routerLink="/login" class="px-6 sm:px-8 py-3 sm:py-4 glass rounded-full text-black font-semibold text-sm sm:text-base md:text-lg hover:bg-black/10 transition-all border border-black/10 w-full sm:w-auto min-h-[44px]">
                    Log In
                </a>
            </div>
            
            <!-- Features Grid -->
            <div class="grid md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 md:mt-20 text-left w-full">
                <div class="glass-card p-4 sm:p-6 rounded-2xl border border-black/5 hover:border-black/30 transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 bg-black/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 text-black text-xl sm:text-2xl">
                        <i class="fas fa-microphone-alt"></i>
                    </div>
                    <h3 class="text-lg sm:text-xl font-bold text-black mb-2">Live Voice Interaction</h3>
                    <p class="text-gray-600 text-xs sm:text-sm leading-relaxed">Speak naturally with our AI. It listens, understands, and responds in real-time just like a human interviewer.</p>
                </div>
                <div class="glass-card p-4 sm:p-6 rounded-2xl border border-black/5 hover:border-black/30 transition-all hover:-translate-y-1 hover:shadow-xl">
                     <div class="w-10 h-10 sm:w-12 sm:h-12 bg-black/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 text-black text-xl sm:text-2xl">
                        <i class="fas fa-file-upload"></i>
                    </div>
                    <h3 class="text-lg sm:text-xl font-bold text-black mb-2">Resume Based</h3>
                    <p class="text-gray-600 text-xs sm:text-sm leading-relaxed">Upload your PDF resume. We analyze your experience to ask relevant, tailored questions specific to your role.</p>
                </div>
                <div class="glass-card p-4 sm:p-6 rounded-2xl border border-black/5 hover:border-black/30 transition-all hover:-translate-y-1 hover:shadow-xl">
                     <div class="w-10 h-10 sm:w-12 sm:h-12 bg-black/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 text-black text-xl sm:text-2xl">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3 class="text-lg sm:text-xl font-bold text-black mb-2">Detailed Feedback</h3>
                    <p class="text-gray-600 text-xs sm:text-sm leading-relaxed">Get a comprehensive score and question-by-question breakdown to identify your weak spots immediately.</p>
                </div>
            </div>
            <!-- Pricing Section -->
            <section id="pricing" class="mt-20 sm:mt-24 md:mt-32 w-full max-w-6xl mx-auto px-4 pb-12 sm:pb-16 animate-fade-in-up">
                <div class="text-center mb-12 sm:mb-16">
                    <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-4">Simple, Transparent Pricing</h2>
                    <p class="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">Choose the plan that fits your career goals. No hidden fees, just pure interview prep.</p>
                </div>

                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-4">
                    <!-- Free Tier -->
                    <div class="glass-card flex flex-col p-6 sm:p-8 rounded-3xl border border-black/5 hover:border-black/20 transition-all hover:-translate-y-2 bg-white/50 relative overflow-hidden group">
                        <div class="mb-6 sm:mb-8">
                             <h3 class="text-xl sm:text-2xl font-bold text-black mb-2">Free</h3>
                             <p class="text-gray-500 text-sm">Best for trying out the platform.</p>
                        </div>
                        <div class="flex items-baseline mb-6 sm:mb-8">
                            <span class="text-4xl sm:text-5xl font-extrabold text-black">₹0</span>
                            <span class="text-gray-500 ml-1">/month</span>
                        </div>
                        <ul class="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-grow text-left">
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                2 Mock Interviews /mo
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                Basic AI Feedback
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base opacity-50">
                                <i class="fas fa-times-circle text-gray-400 mr-2 text-lg"></i>
                                Resume Tailoring
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base opacity-50">
                                <i class="fas fa-times-circle text-gray-400 mr-2 text-lg"></i>
                                Priority Support
                            </li>
                        </ul>
                        <a routerLink="/signup" class="w-full py-3 sm:py-4 rounded-xl border border-black text-black font-bold hover:bg-black hover:text-white transition-all text-center">Get Started</a>
                    </div>

                    <!-- Pro Tier (Recommended) -->
                    <div class="glass-card flex flex-col p-6 sm:p-8 rounded-3xl border-2 border-black/80 scale-100 sm:scale-105 transition-all hover:-translate-y-2 bg-white shadow-2xl shadow-black/10 relative overflow-hidden group">
                         <div class="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-bl-xl">Recommended</div>
                         <div class="mb-6 sm:mb-8">
                             <h3 class="text-xl sm:text-2xl font-bold text-black mb-2">Pro</h3>
                             <p class="text-gray-500 text-sm">For serious job seekers.</p>
                        </div>
                        <div class="flex items-baseline mb-6 sm:mb-8">
                            <span class="text-4xl sm:text-5xl font-extrabold text-black">₹999</span>
                            <span class="text-gray-500 ml-1">/month</span>
                        </div>
                        <ul class="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-grow text-left">
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                Unlimited Mock Interviews
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                Advanced Question Analysis
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                AI-Tailored Resume Tips
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                Real-time Interview Coach
                            </li>
                        </ul>
                        <a routerLink="/signup" class="w-full py-3 sm:py-4 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-all text-center shadow-lg hover:shadow-xl">Upgrade to Pro</a>
                    </div>

                    <!-- Enterprise Tier -->
                    <div class="glass-card flex flex-col p-6 sm:p-8 rounded-3xl border border-black/5 hover:border-black/20 transition-all hover:-translate-y-2 bg-white/50 relative overflow-hidden group">
                        <div class="mb-6 sm:mb-8">
                             <h3 class="text-xl sm:text-2xl font-bold text-black mb-2">Enterprise</h3>
                             <p class="text-gray-500 text-sm">For bootcamps & universities.</p>
                        </div>
                        <div class="flex items-baseline mb-6 sm:mb-8">
                            <span class="text-4xl sm:text-5xl font-extrabold text-black">Contact</span>
                        </div>
                        <ul class="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-grow text-left">
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                50+ Team Accounts
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                Custom Interview Personas
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                Bulk Export Reports
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                Dedicated Support Manager
                            </li>
                        </ul>
                        <button class="w-full py-3 sm:py-4 rounded-xl border border-black/20 text-gray-600 font-bold hover:bg-black hover:text-white transition-all">Contact Sales</button>
                    </div>
                </div>
            </section>
        </div>
      </main>

      <app-legal-footer />
    </div>
  `
})
export class LandingComponent { }
