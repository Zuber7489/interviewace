
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal/legal-footer.component';
import { PublicNavbarComponent } from './public-navbar.component';

@Component({
    selector: 'app-landing',
    imports: [CommonModule, RouterLink, LegalFooterComponent, PublicNavbarComponent],
    template: `
    <div class="min-h-screen flex flex-col font-sans selection:bg-black/10 bg-white">
      <app-public-navbar />

      <!-- Hero Section -->
      <main class="flex-grow flex flex-col items-center px-4 pt-8 sm:pt-12 pb-12 relative overflow-hidden">
        <!-- Minimal Grid Background -->
        <div class="absolute inset-0 z-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 40px 40px;"></div>
        
        <div class="max-w-5xl mx-auto space-y-6 sm:space-y-10 relative z-10 text-center">
            <!-- Subtle Badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.03] border border-black/[0.05] animate-fade-in">
                <span class="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                <span class="text-black text-[10px] sm:text-xs font-medium tracking-tight">AI Technical Interview Platform</span>
            </div>
            
            <div class="space-y-2 sm:space-y-4">
                <h1 class="text-4xl sm:text-6xl md:text-7xl font-bold text-black tracking-tighter leading-[0.95] animate-fade-in-up">
                    The AI Interviewer<br>
                    <span class="text-gray-400">That Lands Offers.</span>
                </h1>
                
                <p class="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed font-medium">
                    Stop practicing in the mirror. Train with ultra-realistic voice AI tailored to your exact tech stack and resume.
                </p>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-0 animate-fade-in" style="animation-delay: 0.2s;">
                <a routerLink="/signup" class="px-6 py-3 bg-black text-white rounded-full font-bold text-sm sm:text-base hover:bg-gray-900 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/10">
                    Get Started Free
                </a>
                <a routerLink="/login" class="px-6 py-3 bg-white text-black border border-black/10 rounded-full font-bold text-sm sm:text-base hover:bg-black/[0.02] transition-all">
                    Sign In
                </a>
            </div>

            <!-- Video Section - The Centerpiece -->
            <div class="pt-8 sm:pt-12 w-full animate-fade-in" style="animation-delay: 0.4s;">
                <div class="relative max-w-4xl mx-auto group">
                    <div class="absolute -inset-1 bg-gradient-to-b from-black/[0.05] to-transparent rounded-[2rem] blur-lg opacity-50 transition duration-1000 group-hover:opacity-100"></div>
                    
                    <div class="relative bg-white p-1 rounded-[1.8rem] border border-black/[0.08] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)]">
                        <div class="relative rounded-[1.6rem] overflow-hidden aspect-video bg-gray-50">
                            <video 
                                class="w-full h-full object-cover"
                                loop 
                                playsinline
                                controls
                                preload="metadata"
                            >
                                <source src="assets/grok-video-a3c63fec-d284-4d08-8d02-e1fbad244abf (1).mp4" type="video/mp4">
                            </video>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Features - Minimalist List -->
            <div class="grid md:grid-cols-3 gap-8 sm:gap-12 pt-12 sm:pt-16 text-left max-w-4xl mx-auto">
                <div class="space-y-2">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">01 / Audio</span>
                    <h3 class="text-lg font-bold text-black tracking-tight">Real-time Voice</h3>
                    <p class="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">Naturally converse with an AI that understands nuance, tone, and technical depth.</p>
                </div>
                <div class="space-y-2">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">02 / Resume</span>
                    <h3 class="text-lg font-bold text-black tracking-tight">Context Aware</h3>
                    <p class="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">Every question is tailored to your specific experience and the role you're targeting.</p>
                </div>
                <div class="space-y-2">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">03 / Analytics</span>
                    <h3 class="text-lg font-bold text-black tracking-tight">Precise Insights</h3>
                    <p class="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">Objective feedback on your communication, technical skills, and confidence levels.</p>
                </div>
            </div>

            <!-- Pricing Section - High-End Minimal -->
            <section id="pricing" class="pt-12 sm:pt-16 pb-4 w-full max-w-3xl mx-auto">
                <div class="grid md:grid-cols-2 gap-px bg-black/[0.05] rounded-2xl overflow-hidden border border-black/[0.05]">
                    <!-- Free -->
                    <div class="bg-white p-8 sm:p-12 text-left flex flex-col justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-black mb-1">Standard</h3>
                            <p class="text-gray-400 text-xs mb-8 uppercase tracking-widest font-bold">For newcomers</p>
                            <div class="flex items-baseline mb-8">
                                <span class="text-4xl font-bold text-black">₹0</span>
                                <span class="text-gray-400 text-sm ml-1">/ forever</span>
                            </div>
                            <ul class="space-y-3 mb-12">
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> 2 Complete Interviews</li>
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> Basic Performance Report</li>
                                <li class="text-sm text-gray-400 flex items-center gap-2 opacity-30"><i class="fas fa-minus text-[10px]"></i> Resume Personalization</li>
                            </ul>
                        </div>
                        <a routerLink="/signup" class="w-full py-4 rounded-xl border border-black/10 text-black font-bold text-sm hover:bg-black hover:text-white transition-all text-center">Get Started</a>
                    </div>

                    <!-- Pro -->
                    <div class="bg-gray-50 p-8 sm:p-12 text-left flex flex-col justify-between relative">
                        <div class="absolute top-4 right-8 px-2 py-0.5 rounded text-[10px] font-bold bg-black text-white uppercase tracking-tighter">Recommended</div>
                        <div>
                            <h3 class="text-lg font-bold text-black mb-1">Professional</h3>
                            <p class="text-gray-400 text-xs mb-8 uppercase tracking-widest font-bold">For job seekers</p>
                            <div class="flex items-baseline mb-8">
                                <span class="text-4xl font-bold text-black">₹200</span>
                                <span class="text-gray-400 text-sm ml-1">/ 10 pack</span>
                            </div>
                            <ul class="space-y-3 mb-12">
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> 10 Pack Interviews</li>
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> Advanced Resume Analysis</li>
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> Custom Persona Matching</li>
                            </ul>
                        </div>
                        <a routerLink="/signup" class="w-full py-4 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-900 transition-all text-center shadow-lg shadow-black/10">Upgrade Now</a>
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
