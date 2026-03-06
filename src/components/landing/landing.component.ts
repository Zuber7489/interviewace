
import { Component, signal } from '@angular/core';
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

            <!-- ── FIX #3: Stronger CTA with visual weight ── -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-0 animate-fade-in" style="animation-delay: 0.2s;">
                <a routerLink="/signup"
                   id="cta-get-started"
                   class="relative group px-8 py-4 bg-black text-white rounded-full font-bold text-sm sm:text-base hover:bg-gray-900 transition-all hover:scale-[1.04] active:scale-[0.98] shadow-2xl shadow-black/30"
                   style="box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 0 0 0 rgba(0,0,0,0);">
                    <span class="relative z-10 flex items-center gap-2">
                        Get Started Free
                        <i class="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                    </span>
                    <!-- Glow ring -->
                    <span class="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></span>
                </a>
                <a routerLink="/login" class="px-6 py-3 bg-white text-black border border-black/10 rounded-full font-bold text-sm sm:text-base hover:bg-black/[0.02] transition-all">
                    Sign In
                </a>
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

            <!-- ── FIX #5: Interview UI Preview Mockup ── -->
            <section class="pt-12 sm:pt-16 w-full max-w-4xl mx-auto text-left">
                <div class="text-center mb-8">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">What to Expect</span>
                    <h2 class="text-2xl sm:text-3xl font-bold text-black tracking-tight mt-2">Inside Your Interview</h2>
                    <p class="text-sm text-gray-500 mt-2 max-w-md mx-auto">A live, voice-first session with an AI recruiter — no typing required.</p>
                </div>
                <div class="relative rounded-3xl border border-black/[0.07] bg-gray-50 p-4 sm:p-6 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                    <!-- Fake browser chrome -->
                    <div class="flex items-center gap-2 mb-4 pb-3 border-b border-black/[0.06]">
                        <span class="w-3 h-3 rounded-full bg-red-400/70"></span>
                        <span class="w-3 h-3 rounded-full bg-yellow-400/70"></span>
                        <span class="w-3 h-3 rounded-full bg-green-400/70"></span>
                        <span class="ml-3 flex-1 bg-white border border-black/[0.06] rounded-full px-3 py-1 text-[10px] text-gray-400">scoremyinterview.com/interview</span>
                    </div>
                    <!-- Mock interview UI -->
                    <div class="flex flex-col md:flex-row gap-4">
                        <!-- AI Avatar side -->
                        <div class="w-full md:w-1/3 flex flex-col items-center justify-center bg-white rounded-2xl border border-black/[0.06] p-6">
                            <div class="relative w-20 h-20 mb-3">
                                <div class="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
                                <img src="https://acetechnologies.com/assets/images/candidates/cb698ebd6.webp"
                                     alt="AI Interviewer Sophia"
                                     class="relative w-full h-full rounded-full object-cover border-2 border-white shadow-lg">
                                <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
                                    Connected ✓
                                </span>
                            </div>
                            <p class="font-bold text-black text-sm mt-3">Sophia</p>
                            <p class="text-gray-400 text-[10px] uppercase tracking-wide">Senior Technical Recruiter</p>
                            <div class="mt-4 grid grid-cols-2 gap-2 w-full">
                                <div class="bg-gray-50 border border-black/[0.06] rounded-xl p-2 text-center">
                                    <p class="text-[9px] text-gray-400 uppercase font-bold">Time</p>
                                    <p class="font-mono font-bold text-black text-sm">09:41</p>
                                </div>
                                <div class="bg-gray-50 border border-black/[0.06] rounded-xl p-2 text-center">
                                    <p class="text-[9px] text-gray-400 uppercase font-bold">Status</p>
                                    <p class="font-bold text-black text-[10px] bg-black/5 px-1 py-0.5 rounded-full">LIVE</p>
                                </div>
                            </div>
                        </div>
                        <!-- Question + transcript side -->
                        <div class="flex-1 flex flex-col gap-3">
                            <div class="bg-white border border-black/[0.06] rounded-2xl p-4">
                                <div class="flex items-center gap-2 mb-3">
                                    <span class="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                                    <p class="text-[10px] font-bold uppercase tracking-widest text-black">Current Question</p>
                                </div>
                                <p class="text-sm sm:text-base font-semibold text-gray-900 leading-relaxed">
                                    "Can you walk me through the difference between Angular's ChangeDetectionStrategy.Default and OnPush, and when would you use each?"
                                </p>
                                <!-- Fake audio bars -->
                                <div class="flex gap-1 h-5 items-end mt-3 opacity-40">
                                    <div class="w-1 bg-black rounded-full" style="height: 40%"></div>
                                    <div class="w-1 bg-black rounded-full" style="height: 70%"></div>
                                    <div class="w-1 bg-black rounded-full" style="height: 100%"></div>
                                    <div class="w-1 bg-black rounded-full" style="height: 60%"></div>
                                    <div class="w-1 bg-black rounded-full" style="height: 80%"></div>
                                    <div class="w-1 bg-black rounded-full" style="height: 50%"></div>
                                </div>
                            </div>
                            <div class="bg-white border border-black/[0.06] rounded-2xl p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <p class="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-1.5">
                                        <i class="fas fa-terminal text-[9px]"></i> Live Transcript
                                    </p>
                                    <span class="text-[9px] text-gray-400 animate-pulse">Recording...</span>
                                </div>
                                <p class="text-xs text-gray-500 italic leading-relaxed">OnPush reduces unnecessary re-renders by only checking when input references change or events fire from within the component...</p>
                            </div>
                        </div>
                    </div>
                    <!-- Blur overlay with CTA -->
                    <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-50 to-transparent flex items-end justify-center pb-4">
                        <a routerLink="/signup" class="px-6 py-2.5 bg-black text-white rounded-full font-bold text-xs hover:bg-gray-900 transition-all shadow-lg">
                            Try It Free — No Credit Card
                        </a>
                    </div>
                </div>
            </section>

            <!-- ── FIX #4: Accurate Pricing cards ── -->
            <section id="pricing" class="pt-12 sm:pt-16 pb-4 w-full max-w-3xl mx-auto">
                <div class="text-center mb-8">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Simple Pricing</span>
                    <h2 class="text-2xl sm:text-3xl font-bold text-black tracking-tight mt-2">Start Free. Go Further.</h2>
                </div>
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
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> 2 Complete AI Interviews</li>
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> Real-time Voice AI</li>
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> Performance Score Report</li>
                                <li class="text-sm text-gray-400 flex items-center gap-2 opacity-40"><i class="fas fa-minus text-[10px]"></i> Resume-Personalized Questions</li>
                                <li class="text-sm text-gray-400 flex items-center gap-2 opacity-40"><i class="fas fa-minus text-[10px]"></i> Full Chat Transcript</li>
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
                                <span class="text-4xl font-bold text-black">₹199</span>
                                <span class="text-gray-400 text-sm ml-1">/ 10 pack</span>
                            </div>
                            <ul class="space-y-3 mb-12">
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> 10 AI Interview Sessions</li>
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> Real-time Voice AI</li>
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> Performance Score Report</li>
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> Resume-Personalized Questions</li>
                                <li class="text-sm text-gray-600 flex items-center gap-2"><i class="fas fa-check text-[10px] text-black"></i> Full Chat Transcript</li>
                            </ul>
                        </div>
                        <a routerLink="/signup" class="w-full py-4 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-900 transition-all text-center shadow-lg shadow-black/10">Upgrade Now</a>
                    </div>
                </div>
            </section>

            <!-- ── FIX #1: Testimonials / Social Proof ── -->
            <section class="pt-12 sm:pt-16 w-full max-w-4xl mx-auto">
                <div class="text-center mb-8">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Testimonials</span>
                    <h2 class="text-2xl sm:text-3xl font-bold text-black tracking-tight mt-2">Loved by Job Seekers</h2>
                </div>
                <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    @for (t of testimonials; track t.name) {
                    <div class="bg-white border border-black/[0.06] rounded-2xl p-5 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <!-- Stars -->
                        <div class="flex gap-0.5 mb-3">
                            @for (s of [1,2,3,4,5]; track s) {
                            <i class="fas fa-star text-[10px] text-black"></i>
                            }
                        </div>
                        <p class="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4 italic">"{{ t.quote }}"</p>
                        <div class="flex items-center gap-2 mt-auto">
                            <div class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                                <span class="text-xs font-bold text-black">{{ t.name[0] }}</span>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-black">{{ t.name }}</p>
                                <p class="text-[10px] text-gray-400">{{ t.role }}</p>
                            </div>
                        </div>
                    </div>
                    }
                </div>
            </section>

            <!-- ── FIX #2: FAQ Section ── -->
            <section class="pt-12 sm:pt-16 w-full max-w-2xl mx-auto text-left pb-4">
                <div class="text-center mb-8">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">FAQ</span>
                    <h2 class="text-2xl sm:text-3xl font-bold text-black tracking-tight mt-2">Common Questions</h2>
                </div>
                <div class="space-y-2">
                    @for (faq of faqs; track faq.q; let i = $index) {
                    <div class="border border-black/[0.07] rounded-2xl overflow-hidden bg-white">
                        <button class="w-full flex items-center justify-between p-4 sm:p-5 text-left group"
                                (click)="toggleFaq(i)"
                                [attr.aria-expanded]="openFaq() === i">
                            <span class="font-bold text-sm text-black pr-4">{{ faq.q }}</span>
                            <i class="fas flex-shrink-0 text-gray-400 transition-transform duration-300 text-xs"
                               [class.fa-plus]="openFaq() !== i"
                               [class.fa-minus]="openFaq() === i"
                               [class.rotate-180]="openFaq() === i"></i>
                        </button>
                        @if (openFaq() === i) {
                        <div class="px-4 sm:px-5 pb-4 text-sm text-gray-500 leading-relaxed animate-fade-in border-t border-black/[0.05] pt-3">
                            {{ faq.a }}
                        </div>
                        }
                    </div>
                    }
                </div>
            </section>

        </div>
      </main>

      <app-legal-footer />
    </div>
  `,
    styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(12px);}
      to { opacity: 1; transform: translateY(0);}
    }
    .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
  `]
})
export class LandingComponent {
    openFaq = signal<number | null>(null);

    toggleFaq(i: number) {
        this.openFaq.update(v => v === i ? null : i);
    }

    readonly testimonials = [
        {
            name: 'Arjun M.',
            role: 'SDE-2 at Flipkart',
            quote: "ScoreMyInterview helped me crush 3 rounds at Flipkart. The AI asks exactly the kind of questions they do at real interviews."
        },
        {
            name: 'Priya S.',
            role: 'Frontend Engineer at Razorpay',
            quote: "I practiced for just 2 days before my Razorpay final round and cleared it. This is the most realistic mock interview tool I've used."
        },
        {
            name: 'Karan T.',
            role: 'Full Stack Developer',
            quote: "The AI caught things I didn't even notice — weak answers, filler words. My confidence went up massively after a few sessions."
        }
    ];

    readonly faqs = [
        {
            q: 'Is this really free to start?',
            a: 'Yes! You get 2 complete AI interview sessions at no cost, with no credit card required. Each session includes real-time voice conversation and a scored performance report.'
        },
        {
            q: 'How does the voice AI work?',
            a: 'We use Google\'s Gemini Live audio model. The AI speaks to you through your speakers and listens via your microphone — just like a real phone or video interview. You need microphone access enabled in your browser.'
        },
        {
            q: 'Can I upload my resume?',
            a: 'Yes! You can upload a PDF resume before starting your interview. The AI will tailor every question to your specific experience, skills, and the role you\'re targeting.'
        },
        {
            q: 'What kinds of interviews can I practice?',
            a: 'You can configure your interview for any tech stack — React, Angular, Python, System Design, Data Engineering, and more. Just type your target role and focus areas.'
        },
        {
            q: 'What languages are supported?',
            a: 'Currently English, Hindi, and Hinglish (mix of Hindi and English) are supported for the interviewer\'s language.'
        },
        {
            q: 'Is my data safe?',
            a: 'Your interview transcripts and scores are stored securely in Firebase under your account. We never share your data with third parties. You can delete your history anytime from the dashboard.'
        }
    ];
}
