import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { StateService } from '../../services/state.service';
import { getDatabase, ref as dbRef, get } from 'firebase/database';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '../../firebase.config';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

@Component({
  selector: 'app-admin-user-detail',
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">
      
      <!-- Header / Back Button -->
      <button (click)="goBack()" class="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
        <i class="fas fa-arrow-left"></i> Back to Admin Panel
      </button>

      @if (isLoading()) {
        <div class="flex justify-center p-12">
            <i class="fas fa-circle-notch fa-spin text-3xl text-red-500"></i>
        </div>
      } @else if (!user()) {
        <div class="bg-white rounded-2xl p-12 text-center shadow-sm border border-red-100">
            <i class="fas fa-user-slash text-4xl text-gray-300 mb-4"></i>
            <h2 class="text-xl font-bold text-gray-700">User not found</h2>
            <p class="text-gray-500 mt-2">The user you are looking for does not exist or has been removed.</p>
        </div>
      } @else {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Header -->
          <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {{ user()?.name }}'s Profile
                @if(user()?.isAdmin) {
                  <span class="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Admin</span>
                }
              </h2>
              <p class="text-sm text-gray-500 mt-1">{{ user()?.email }} | ID: <span class="font-mono text-gray-400">{{ user()?.id }}</span></p>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-8 bg-gray-50/50">
            
            <!-- Setup & Resume Section -->
            <section>
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fas fa-file-alt text-blue-500"></i> Resume & Profile Data
              </h3>
              <div class="bg-white border text-sm border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                @if(user()?.profile) {
                   <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Role</span> <div class="font-medium font-sans">{{ user()?.profile?.role || 'N/A' }}</div></div>
                      <div><span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Experience</span> <div class="font-medium font-sans">{{ user()?.profile?.experience }} Years</div></div>
                      <div class="sm:col-span-2"><span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Skills</span> <div class="font-medium font-sans bg-blue-50/50 p-2 rounded">{{ user()?.profile?.skills || 'N/A' }}</div></div>
                   </div>
                   @if(user()?.profile?.resumeText) {
                     <div class="mt-4">
                       <span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-2">Extracted Resume Text Preview</span>
                       <div class="bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs text-gray-600 h-32 overflow-y-auto whitespace-pre-wrap font-mono">{{ user()?.profile?.resumeText }}</div>
                     </div>
                   }
                } @else if (userHistory().length > 0 && userHistory()[0].config) {
                   <div class="mb-3 border-b pb-2"><span class="text-gray-800 font-bold flex items-center gap-1.5"><i class="fas fa-magic text-purple-500"></i> Auto-Extracted from Latest Session</span></div>
                   <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Target Tech</span> <div class="font-medium font-sans">{{ userHistory()[0].config.primaryTechnology || 'N/A' }}</div></div>
                      <div><span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Experience</span> <div class="font-medium font-sans">{{ userHistory()[0].config.yearsOfExperience }} Years</div></div>
                      <div class="sm:col-span-2"><span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Skills Configured</span> <div class="font-medium font-sans bg-blue-50/50 p-2 rounded">{{ userHistory()[0].config.secondarySkills || 'N/A' }}</div></div>
                   </div>
                   @if(userHistory()[0].config?.resumeText) {
                     <div class="mt-4">
                       <span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-2">Resume Text (Session Context)</span>
                       <div class="bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs text-gray-600 h-32 overflow-y-auto whitespace-pre-wrap font-mono">{{ userHistory()[0].config.resumeText }}</div>
                     </div>
                   } @else {
                       <p class="text-gray-400 italic text-xs mt-4">No physical PDF/resume attached in the latest session.</p>
                   }
                } @else {
                   <p class="text-gray-400 italic">No formal profile configuration or resume saved yet.</p>
                }
              </div>
            </section>

            <!-- Interview History Logs -->
            <section>
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fas fa-history text-orange-500"></i> Past Interview Sessions
              </h3>
              
              <div class="space-y-3">
                @if (userHistory().length === 0) {
                  <div class="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500 shadow-sm">
                    <i class="fas fa-microphone-slash text-3xl mb-3 text-gray-300"></i>
                    <p>No interview history found for this user.</p>
                  </div>
                } @else {
                  @for(session of userHistory(); track session.id) {
                    <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-gray-200 hover:shadow-md">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-bold text-gray-900">{{ session.config?.primaryTechnology }} Interview</span>
                          @if(session.overallScore) {
                            <span class="text-xs px-2 py-0.5 rounded-full font-bold" [class.bg-green-100]="session.overallScore >= 70" [class.text-green-700]="session.overallScore >= 70" [class.bg-orange-100]="session.overallScore < 70" [class.text-orange-700]="session.overallScore < 70">
                              Score: {{ session.overallScore }}%
                            </span>
                          }
                        </div>
                        <div class="text-xs text-gray-500 flex items-center gap-3">
                          <span><i class="far fa-calendar-alt mr-1"></i> {{ session.startTime | date:'medium' }}</span>
                          <span><i class="far fa-clock mr-1"></i> {{ session.config?.interviewDuration }} min</span>
                        </div>
                      </div>
                       <!-- Admin view report functionality -->
                       <button (click)="viewReport(session.id, user()?.id)" class="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap">
                         <i class="fas fa-external-link-alt"></i> View Report
                       </button>
                    </div>
                  }
                }
              </div>
            </section>

          </div>
        </div>
      }
    </div>
  `
})
export class AdminUserDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  stateService = inject(StateService);

  userId = signal<string | null>(null);
  user = signal<any>(null);
  userHistory = signal<any[]>([]);
  isLoading = signal(true);

  constructor() {
    effect(() => {
      const currentUser = this.authService.currentUser();
      if (currentUser && !currentUser.isAdmin) {
        this.router.navigate(['/dashboard']);
        this.toastService.error("Unauthorized access.");
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId.set(id);
        this.loadUserDetails(id);
      } else {
        this.isLoading.set(false);
      }
    });
  }

  async loadUserDetails(userId: string) {
    this.isLoading.set(true);
    try {
      const dbRefNode = dbRef(database, `users/${userId}`);
      const snap = await get(dbRefNode);
      if (snap.exists()) {
        const fullData = snap.val();
        this.user.set({ ...fullData, id: userId });

        if (fullData.history) {
          const hArray = Object.values(fullData.history).sort((a: any, b: any) => b.startTime - a.startTime);
          this.userHistory.set(hArray);
        }
      }
    } catch (e) {
      console.error("Failed to fetch detailed info", e);
      this.toastService.error("Failed to load user details.");
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/admin']);
  }

  async viewReport(sessionId: string, uId: string) {
    try {
      const snap = await get(dbRef(database, `users/${uId}/history/${sessionId}`));
      if (snap.exists()) {
        this.stateService.activeSession.set(snap.val());
        this.router.navigate(['/report']);
      }
    } catch (e) {
      this.toastService.error("Could not load report.");
    }
  }
}
