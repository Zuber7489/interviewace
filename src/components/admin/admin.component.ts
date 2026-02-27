import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { getDatabase, ref as dbRef, get, update } from 'firebase/database';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '../../firebase.config';
import { User, SubscriptionTier } from '../../models';
import { Router } from '@angular/router';
import { StateService } from '../../services/state.service';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-red-600 flex items-center gap-2">
          <i class="fas fa-shield-alt"></i> Admin Dashboard
        </h1>
        <div class="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Total Users: {{ users().length }}
        </div>
      </div>
      
      <div class="glass-card p-4 sm:p-6 rounded-2xl border border-red-500/20 bg-white">
        <!-- Search and Filters -->
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <div class="relative flex-1">
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search users by name, email or ID..."
              class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
          </div>
          <button (click)="loadUsers()" [disabled]="isLoading()"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
            <i class="fas" [class.fa-sync]="!isLoading()" [class.fa-spinner]="isLoading()" [class.fa-spin]="isLoading()"></i> Refresh
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="border-b-2 border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th class="p-3 font-bold">User Info</th>
                <th class="p-3 font-bold">Plan Details</th>
                <th class="p-3 font-bold text-center">Interviews Used</th>
                <th class="p-3 font-bold text-center">Max Interviews</th>
                <th class="p-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              @if (isLoading() && users().length === 0) {
                <tr>
                  <td colspan="5" class="p-8 text-center text-gray-500">
                    <i class="fas fa-circle-notch fa-spin text-2xl mb-2"></i>
                    <p>Loading users...</p>
                  </td>
                </tr>
              } @else if (filteredUsers().length === 0) {
                <tr>
                  <td colspan="5" class="p-8 text-center text-gray-500 font-medium">No users found.</td>
                </tr>
              } @else {
                @for (user of filteredUsers(); track user.id) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer" (click)="viewDetails(user)">
                    <td class="p-3">
                      <div class="font-bold text-black flex items-center gap-1.5">
                        {{ user.name }}
                        @if(user.isAdmin) {
                          <span class="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold"><i class="fas fa-crown text-[8px] mr-1"></i>Admin</span>
                        }
                      </div>
                      <div class="text-xs text-gray-500">{{ user.email }}</div>
                      <div class="text-[10px] text-gray-400 font-mono mt-0.5" title="User ID">ID: {{ user.id }}</div>
                    </td>
                    <td class="p-3" (click)="$event.stopPropagation()">
                      <select [ngModel]="user.subscription || 'free'" (ngModelChange)="updateTier(user, $event)"
                        class="bg-transparent border border-gray-200 rounded px-2 py-1 text-xs font-bold focus:outline-none focus:border-black cursor-pointer uppercase">
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                      </select>
                    </td>
                    <td class="p-3 text-center font-bold">
                      {{ user.interviewsCount || 0 }}
                    </td>
                    <td class="p-3 text-center" (click)="$event.stopPropagation()">
                      <input type="number" min="0" [ngModel]="user.maxInterviews ?? (user.subscription === 'pro' ? 10 : 2)" (change)="updateMaxInterviews(user, $event)"
                        class="w-16 text-center border border-gray-200 rounded px-1 py-1 text-xs font-bold focus:outline-none focus:border-black bg-transparent" />
                    </td>
                    <td class="p-3 text-right" (click)="$event.stopPropagation()">
                       <!-- Extra optional actions -->
                       @if(!user.isAdmin) {
                          <button (click)="toggleAdmin(user)" class="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded transition-colors whitespace-nowrap">Make Admin</button>
                       } @else {
                          <button (click)="toggleAdmin(user)" class="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-2 py-1 rounded transition-colors whitespace-nowrap">Remove Admin</button>
                       }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        <!-- Detailed User View Overlay -->
        @if (selectedUser()) {
          <div class="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
              
              <!-- Header -->
              <div class="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                <div>
                  <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {{ selectedUser()?.name }}'s Profile
                    @if(selectedUser()?.isAdmin) {
                      <span class="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Admin</span>
                    }
                  </h2>
                  <p class="text-sm text-gray-500 mt-1">{{ selectedUser()?.email }} | ID: <span class="font-mono text-gray-400">{{ selectedUser()?.id }}</span></p>
                </div>
                <button (click)="closeDetails()" class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- Content Scrollable -->
              <div class="p-6 overflow-y-auto flex-1 space-y-8 bg-gray-50/50">
                
                <!-- Setup & Resume Section -->
                <section>
                  <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i class="fas fa-file-alt text-blue-500"></i> Resume & Profile Data
                  </h3>
                  <div class="bg-white border text-sm border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                    @if(selectedUser()?.profile) {
                       <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div><span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Role</span> <div class="font-medium font-sans">{{ selectedUser()?.profile?.role || 'N/A' }}</div></div>
                          <div><span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Experience</span> <div class="font-medium font-sans">{{ selectedUser()?.profile?.experience }} Years</div></div>
                          <div class="sm:col-span-2"><span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Skills</span> <div class="font-medium font-sans bg-blue-50/50 p-2 rounded">{{ selectedUser()?.profile?.skills || 'N/A' }}</div></div>
                       </div>
                       @if(selectedUser()?.profile?.resumeText) {
                         <div class="mt-4">
                           <span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-2">Extracted Resume Text Preview</span>
                           <div class="bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs text-gray-600 h-32 overflow-y-auto whitespace-pre-wrap font-mono">{{ selectedUser()?.profile?.resumeText }}</div>
                         </div>
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
                           <button (click)="viewReport(session.id, selectedUser()?.id)" class="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap">
                             <i class="fas fa-external-link-alt"></i> View Report
                           </button>
                        </div>
                      }
                    }
                  </div>
                </section>

              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminComponent {
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);

  users = signal<User[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  selectedUser = signal<any>(null); // To view detailed user information

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !user.isAdmin) {
        // Additional protection at component level
        this.router.navigate(['/dashboard']);
        this.toastService.error("Unauthorized access.");
      } else if (user?.isAdmin) {
        this.loadUsers();
      }
    });
  }

  async loadUsers() {
    this.isLoading.set(true);
    try {
      const dbRefNode = dbRef(database, 'users');
      const snap = await get(dbRefNode);
      if (snap.exists()) {
        const usersData = snap.val();
        const usersArray: User[] = [];
        for (let uid in usersData) {
          if (usersData.hasOwnProperty(uid)) {
            usersArray.push({
              ...usersData[uid],
              id: uid // Must map the unique Firebase key into the data structure 
            });
          }
        }
        this.users.set(usersArray);
      } else {
        this.users.set([]);
      }
    } catch (error) {
      this.toastService.error("Failed to load users list.");
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  filteredUsers() {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.users();
    return this.users().filter(u =>
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.id && u.id.toLowerCase().includes(query))
    );
  }

  userHistory = signal<any[]>([]);
  stateService = inject(StateService);

  async viewDetails(user: User) {
    this.selectedUser.set(user);
    this.userHistory.set([]); // clear prev

    // Fetch profile (which might be under `users/${user.id}/profile`)
    try {
      const dbRefNode = dbRef(database, `users/${user.id}`);
      const snap = await get(dbRefNode);
      if (snap.exists()) {
        const fullData = snap.val();
        this.selectedUser.set({ ...user, profile: fullData.profile });

        // Map history
        if (fullData.history) {
          const hArray = Object.values(fullData.history).sort((a: any, b: any) => b.startTime - a.startTime);
          this.userHistory.set(hArray);
        }
      }
    } catch (e) {
      console.error("Failed to fetch detailed info", e);
    }
  }

  closeDetails() {
    this.selectedUser.set(null);
    this.userHistory.set([]);
  }

  async viewReport(sessionId: string, userId: string) {
    // Typically the report page reads from `stateService.activeSession()`
    // So we fetch it specifically for that user, seed the state, and route
    try {
      const snap = await get(dbRef(database, `users/${userId}/history/${sessionId}`));
      if (snap.exists()) {
        import('../../services/state.service').then(m => {
          const state = inject(m.StateService);
          state.activeSession.set(snap.val()); // forcefully seat the session
          this.router.navigate(['/report']);
        });
      }
    } catch (e) {
      this.toastService.error("Could not load report.");
    }
  }

  async updateTier(user: User, newTier: string) {
    if (user.subscription === newTier) return;
    try {
      await update(dbRef(database, `users/${user.id}`), {
        subscription: newTier,
        // usually resetting usages when tier changes
        interviewsCount: 0,
        maxInterviews: newTier === 'pro' ? 10 : 2
      });
      this.toastService.success(`Updated ${user.name} to ${newTier.toUpperCase()} successfully.`);
      this.loadUsers(); // Refresh
    } catch (err) {
      this.toastService.error("Failed to update user subscription.");
    }
  }

  async adjustInterviews(user: User, delta: number) {
    const current = user.interviewsCount || 0;
    const next = current + delta;
    if (next < 0) return;

    try {
      await update(dbRef(database, `users/${user.id}`), {
        interviewsCount: next
      });
      // Just update local signal manually to save DB reads
      this.users.update(list => list.map(u => u.id === user.id ? { ...u, interviewsCount: next } : u));
    } catch (err) {
      this.toastService.error("Failed to update interview count.");
    }
  }

  async updateMaxInterviews(user: User, event: any) {
    const newVal = parseInt(event.target.value, 10);
    if (isNaN(newVal) || newVal < 0) return;

    try {
      await update(dbRef(database, `users/${user.id}`), {
        maxInterviews: newVal
      });
      this.users.update(list => list.map(u => u.id === user.id ? { ...u, maxInterviews: newVal } : u));
      this.toastService.success("Max interviews updated.");
    } catch (err) {
      this.toastService.error("Failed to update max interviews.");
    }
  }

  async toggleAdmin(user: User) {
    const isNowAdmin = !user.isAdmin;

    if (isNowAdmin && !confirm(`Are you sure you want to make ${user.name} an Admin? They will have full access.`)) {
      return;
    }

    if (!isNowAdmin && user.id === this.authService.currentUser()?.id) {
      if (!confirm(`Warning: You are stripping YOUR OWN Admin rights. You will lose access immediately. Proceed?`)) {
        return;
      }
    }

    try {
      await update(dbRef(database, `users/${user.id}`), {
        isAdmin: isNowAdmin
      });
      this.users.update(list => list.map(u => u.id === user.id ? { ...u, isAdmin: isNowAdmin } : u));
      this.toastService.success(`${user.name} is ${isNowAdmin ? 'now an Admin' : 'no longer an Admin'}.`);

      if (!isNowAdmin && user.id === this.authService.currentUser()?.id) {
        this.authService.currentUser.update(u => u ? { ...u, isAdmin: false } : u); // will trigger effect to boot us out
      }

    } catch (err) {
      this.toastService.error("Failed to update admin rights.");
    }
  }
}
