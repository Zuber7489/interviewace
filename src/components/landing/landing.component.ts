
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-landing',
    imports: [CommonModule, RouterLink],
    template: `
    <div class="min-h-screen flex flex-col font-sans selection:bg-black/30">
      <!-- Navbar -->
      <nav class="glass sticky top-0 z-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-black/10 backdrop-blur-md bg-white/80 supports-[backdrop-filter]:bg-white/40">
        <button class="flex items-center gap-1.5 sm:gap-2 group focus:outline-none" routerLink="/">
           <i class="fas fa-brain text-black text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300"></i>
           <span class="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 tracking-tight">InterviewAce</span>
        </button>
        <div class="flex items-center gap-2 sm:gap-4 md:gap-6">
          <a routerLink="/login" class="text-xs sm:text-sm md:text-base font-medium text-gray-600 hover:text-black transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-black after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Login</a>
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
        </div>
      </main>

      <footer class="py-6 sm:py-8 text-center text-gray-500 text-[10px] sm:text-xs md:text-sm border-t border-black/5 bg-white">
        &copy; 2025 InterviewAce. Built with Gemini 2.0 Flash.
      </footer>
    </div>
  `
})
export class LandingComponent { }
