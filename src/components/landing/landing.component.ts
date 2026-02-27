
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal/legal-footer.component';
import { PublicNavbarComponent } from './public-navbar.component';

@Component({
    selector: 'app-landing',
    imports: [CommonModule, RouterLink, LegalFooterComponent, PublicNavbarComponent],
    template: `
    <div class="min-h-screen flex flex-col font-sans selection:bg-black/30">
      <app-public-navbar />

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

            <!-- Video Section -->
            <div class="pt-16 sm:pt-20 md:pt-24 w-full">
                <div class="inline-block px-4 py-1.5 rounded-full bg-black/5 border border-black/5 mb-8">
                    <span class="text-black text-[10px] sm:text-xs font-bold tracking-widest uppercase">Experience ScoreMyInterview in Action</span>
                </div>
                
                <div class="relative max-w-5xl mx-auto">
                    <!-- Decorative background glow -->
                    <div class="absolute -inset-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                    
                    <div class="relative glass p-2 sm:p-4 rounded-[2.5rem] border border-black/10 shadow-2xl">
                        <div class="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden aspect-video bg-black/5 shadow-inner">
                            <video 
                                class="w-full h-full object-cover"
                                autoplay 
                                muted 
                                loop 
                                playsinline
                                controls
                            >
                                <source src="assets/grok-video-a3c63fec-d284-4d08-8d02-e1fbad244abf (1).mp4" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>

                    <!-- Floating Badge -->
                    <div class="absolute -bottom-6 -right-6 hidden md:block animate-float">
                        <div class="glass py-4 px-6 rounded-2xl border border-black/10 shadow-xl flex items-center gap-4">
                            <div class="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
                                <i class="fas fa-play text-xs"></i>
                            </div>
                            <div class="text-left">
                                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Demo</p>
                                <p class="text-xs font-bold text-black">Watch AI Interview</p>
                            </div>
                        </div>
                    </div>
                </div>
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
                    <p class="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">No subscriptions. No hidden fees. Just pay when you need more interviews.</p>
                </div>

                <div class="grid sm:grid-cols-2 gap-6 sm:gap-8 items-stretch pt-4 max-w-3xl mx-auto">
                    <!-- Free Tier -->
                    <div class="glass-card flex flex-col p-6 sm:p-8 rounded-3xl border border-black/5 hover:border-black/20 transition-all hover:-translate-y-2 bg-white/50 relative overflow-hidden group">
                        <div class="mb-6 sm:mb-8">
                             <h3 class="text-xl sm:text-2xl font-bold text-black mb-2">Free</h3>
                             <p class="text-gray-500 text-sm">Best for trying out the platform.</p>
                        </div>
                        <div class="flex items-baseline mb-6 sm:mb-8">
                            <span class="text-4xl sm:text-5xl font-extrabold text-black">₹0</span>
                            <span class="text-gray-500 ml-2 text-sm">forever</span>
                        </div>
                        <ul class="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-grow text-left">
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                2 Mock Interviews
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                AI Feedback Report
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
                        <a routerLink="/signup" class="w-full py-3 sm:py-4 rounded-xl border border-black text-black font-bold hover:bg-black hover:text-white transition-all text-center">Get Started Free</a>
                    </div>

                    <!-- Pro Tier -->
                    <div class="glass-card flex flex-col p-6 sm:p-8 rounded-3xl border-2 border-black/80 transition-all hover:-translate-y-2 bg-white shadow-2xl shadow-black/10 relative overflow-hidden group">
                         <div class="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-bl-xl">Most Popular</div>
                         <div class="mb-6 sm:mb-8">
                             <h3 class="text-xl sm:text-2xl font-bold text-black mb-2">Pro Pack</h3>
                             <p class="text-gray-500 text-sm">For serious job seekers.</p>
                        </div>
                        <div class="flex items-baseline gap-1 mb-2">
                            <span class="text-4xl sm:text-5xl font-extrabold text-black">₹200</span>
                        </div>
                        <p class="text-sm text-gray-500 mb-6 sm:mb-8 font-medium">for 10 interviews &nbsp;•&nbsp; buy again anytime</p>
                        <ul class="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-grow text-left">
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                10 Mock Interviews per pack
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                Advanced AI Feedback
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                Resume-Based Questions
                            </li>
                            <li class="flex items-center text-gray-700 text-sm sm:text-base">
                                <i class="fas fa-check-circle text-black mr-2 text-lg"></i>
                                No subscription — pay when needed
                            </li>
                        </ul>
                        <a routerLink="/signup" class="w-full py-3 sm:py-4 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-all text-center shadow-lg hover:shadow-xl">Buy Pro Pack</a>
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
