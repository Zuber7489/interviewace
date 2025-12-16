
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-landing',
    imports: [CommonModule, RouterLink],
    template: `
    <div class="min-h-screen flex flex-col">
      <!-- Navbar -->
      <nav class="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/10">
        <div class="flex items-center gap-2">
           <i class="fas fa-brain text-blue-500 text-2xl"></i>
           <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">InterviewAce</span>
        </div>
        <div class="flex gap-4">
          <a routerLink="/login" class="text-slate-300 hover:text-white transition-colors font-medium">Login</a>
          <a routerLink="/signup" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-500/30">Get Started</a>
        </div>
      </nav>

      <!-- Hero Section -->
      <main class="flex-grow flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -z-10 animate-pulse" style="animation-delay: 1s;"></div>

        <div class="max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10">
            <div class="inline-block glass px-4 py-1.5 rounded-full border border-white/10 mb-4">
                <span class="text-blue-400 text-sm font-semibold tracking-wide uppercase">✨ AI-Powered Technical Interviews</span>
            </div>
            
            <h1 class="text-5xl md:text-7xl font-extrabold text-white leading-tight">
                Master Your Next <br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Technical Interview</span>
            </h1>
            
            <p class="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Practice with realistic, real-time AI interviewers. Upload your resume for a tailored experience, get instant feedback, and boost your confidence.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <a routerLink="/signup" class="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-bold text-lg overflow-hidden shadow-2xl transition-all hover:scale-105 hover:shadow-blue-500/50">
                    <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                    <span class="relative flex items-center">
                        Start Your Mock Interview <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </span>
                </a>
                <a routerLink="/login" class="px-8 py-4 glass rounded-full text-white font-semibold text-lg hover:bg-white/10 transition-all border border-white/10">
                    Log In
                </a>
            </div>
            
            <!-- Features Grid -->
            <div class="grid md:grid-cols-3 gap-6 mt-20 text-left">
                <div class="glass-card p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors">
                    <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400 text-2xl">
                        <i class="fas fa-microphone-alt"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Live Voice Interaction</h3>
                    <p class="text-slate-400">Speak naturally with our AI. It listens, understands, and responds in real-time just like a human interviewer.</p>
                </div>
                <div class="glass-card p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors">
                     <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 text-purple-400 text-2xl">
                        <i class="fas fa-file-upload"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Resume Based</h3>
                    <p class="text-slate-400">Upload your PDF resume. We analyze your experience to ask relevant, tailored questions.</p>
                </div>
                <div class="glass-card p-6 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-colors">
                     <div class="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 text-pink-400 text-2xl">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Detailed Feedback</h3>
                    <p class="text-slate-400">Get a comprehensive score and question-by-question breakdown to identify your weak spots.</p>
                </div>
            </div>
        </div>
      </main>

      <footer class="py-8 text-center text-slate-500 text-sm border-t border-white/5">
        &copy; 2025 InterviewAce. Built with Gemini 2.0 Flash.
      </footer>
    </div>
  `
})
export class LandingComponent { }
