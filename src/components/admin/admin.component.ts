import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { getDatabase, ref as dbRef, get, update, remove, set } from 'firebase/database';
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
        <h1 class="text-2xl sm:text-3xl font-bold text-black flex items-center gap-2">
          <i class="fas fa-shield-alt text-red-600"></i> Admin Panel
        </h1>
        <button (click)="loadUsers()" [disabled]="isLoading()"
          class="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold transition-all hover:bg-gray-800 flex items-center gap-2 shadow-lg shadow-black/10">
          <i class="fas" [class.fa-sync]="!isLoading()" [class.fa-spinner]="isLoading()" [class.fa-spin]="isLoading()"></i> Refresh
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white border-2 border-black/5 p-5 rounded-2xl shadow-sm">
           <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Community</p>
           <p class="text-2xl font-black text-black">{{ allUsers.length }} <span class="text-sm font-medium text-gray-400">USERS</span></p>
        </div>
        <div class="bg-white border-2 border-black/5 p-5 rounded-2xl shadow-sm">
           <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Growth (PRO)</p>
           <p class="text-2xl font-black text-black">{{ proCount() }} <span class="text-sm font-medium text-gray-400">ACTIVE</span></p>
        </div>
        <div class="bg-white border-2 border-black/5 p-5 rounded-2xl shadow-sm">
           <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Interviews</p>
           <p class="text-2xl font-black text-black">{{ totalInterviews() }} <span class="text-sm font-medium text-gray-400">DONE</span></p>
        </div>
        <div class="bg-white border-2 border-black/5 p-5 rounded-2xl shadow-sm">
           <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg. Success</p>
           <p class="text-2xl font-black text-black">74% <span class="text-sm font-medium text-gray-400">SCORE</span></p>
        </div>
      </div>
      
      <div class="bg-white border-2 border-black/5 rounded-3xl overflow-hidden shadow-sm">
        <!-- Search and Filters -->
        <div class="p-6 border-b border-black/5 bg-gray-50/30">
          <div class="relative w-full">
            <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search by name, email or UID..."
              class="w-full pl-11 pr-4 py-3 bg-white border border-black/10 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all">
          </div>
        </div>

        <!-- Mobile View (Card-based) -->
        <div class="block lg:hidden divide-y divide-black/5">
          @if (isLoading() && users().length === 0) {
            <div class="p-12 text-center text-gray-500">
              <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-red-500"></i>
              <p class="font-bold">Syncing Records...</p>
            </div>
          } @else if (filteredUsers().length === 0) {
            <div class="p-12 text-center text-gray-500 font-bold bg-gray-50">No results found for that query.</div>
          } @else {
            @for (u of filteredUsers(); track u.id) {
              <div class="p-5 flex flex-col gap-4" (click)="viewDetails(u)">
                <div class="flex items-center gap-3">
                   <div class="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-bold text-black border border-black/10">
                      {{ u.name[0] }}
                   </div>
                   <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-black truncate">{{ u.name }}</span>
                        @if(u.isAdmin) {
                          <span class="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest">Admin</span>
                        }
                      </div>
                      <p class="text-xs text-gray-500 truncate">{{ u.email }}</p>
                   </div>
                   <i class="fas fa-chevron-right text-gray-300 text-xs"></i>
                </div>
                
                <div class="grid grid-cols-2 gap-3" (click)="$event.stopPropagation()">
                   <div class="flex flex-col gap-1">
                      <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Plan</span>
                      <select [ngModel]="u.subscription || 'free'" (ngModelChange)="updateTier(u, $event)"
                        class="bg-gray-100 border-none rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black/20">
                        <option value="free">FREE</option>
                        <option value="pro">PRO</option>
                      </select>
                   </div>
                   <div class="flex flex-col gap-1">
                      <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Usage</span>
                      <div class="bg-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-black">
                         {{ u.interviewsCount || 0 }} / {{ u.maxInterviews || 2 }}
                      </div>
                   </div>
                </div>

                <div class="flex gap-2" (click)="$event.stopPropagation()">
                   <button (click)="viewDetails(u)" class="flex-1 py-2 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-wider">Profile</button>
                   <button (click)="deleteUser(u)" class="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors">
                      <i class="fas fa-trash-alt"></i>
                   </button>
                </div>
              </div>
            }
          }
        </div>

        <!-- Desktop View (Table) -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr class="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 border-b border-black/5">
                <th class="p-6 font-bold">User Identity</th>
                <th class="p-6 font-bold">Account Level</th>
                <th class="p-6 font-bold text-center">Interviews Used</th>
                <th class="p-6 font-bold text-center">Allocation</th>
                <th class="p-6 font-bold text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-black/5">
              @if (isLoading() && users().length === 0) {
                <tr>
                  <td colspan="5" class="py-20 text-center text-gray-500">
                    <i class="fas fa-circle-notch fa-spin text-3xl mb-4 text-red-500"></i>
                    <p class="font-bold text-gray-900">Synchronizing Global Records...</p>
                  </td>
                </tr>
              } @else if (filteredUsers().length === 0) {
                <tr>
                  <td colspan="5" class="py-20 text-center text-gray-500 font-bold bg-gray-50/50 italic">— No user records found matching the criteria —</td>
                </tr>
              } @else {
                @for (u of filteredUsers(); track u.id) {
                  <tr class="group hover:bg-gray-50/50 transition-colors cursor-pointer" (click)="viewDetails(u)">
                    <td class="p-6">
                      <div class="flex items-center gap-4">
                        <div class="w-11 h-11 rounded-2xl bg-black/5 group-hover:bg-white border border-black/10 flex items-center justify-center font-bold text-black text-lg transition-all shadow-sm">
                           {{ u.name[0] }}
                        </div>
                        <div class="min-w-0">
                           <div class="font-bold text-black text-base flex items-center gap-2">
                             {{ u.name }}
                             @if(u.isAdmin) {
                               <span class="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-lg shadow-red-500/20">Admin</span>
                             }
                           </div>
                           <div class="text-xs text-gray-500 truncate">{{ u.email }}</div>
                           <div class="text-[9px] text-gray-300 font-mono mt-0.5" title="User ID">{{ u.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="p-6" (click)="$event.stopPropagation()">
                      <select [ngModel]="u.subscription || 'free'" (ngModelChange)="updateTier(u, $event)"
                        class="bg-white border border-black/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-black/5 uppercase shadow-sm cursor-pointer hover:border-black transition-all">
                        <option value="free">Standard</option>
                        <option value="pro">Professional</option>
                      </select>
                    </td>
                    <td class="p-6 text-center">
                      <span class="text-base font-black text-black">{{ u.interviewsCount || 0 }}</span>
                    </td>
                    <td class="p-6 text-center" (click)="$event.stopPropagation()">
                      <input type="number" min="0" [ngModel]="u.maxInterviews ?? (u.subscription === 'pro' ? 10 : 2)" (change)="updateMaxInterviews(u, $event)"
                        class="w-16 text-center bg-white border border-black/10 rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-black/5 hover:border-black transition-all shadow-sm" />
                    </td>
                    <td class="p-6" (click)="$event.stopPropagation()">
                       <div class="flex items-center justify-end gap-2">
                         <button (click)="resetInterviewCount(u)" class="h-9 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-blue-100" title="Revoke all usage">
                           Reset
                         </button>
                         <button (click)="viewDetails(u)" class="h-9 px-4 bg-black text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-black/10 hover:scale-105">
                           Profile
                         </button>
                         <button (click)="deleteUser(u)" class="h-9 w-9 bg-red-100 hover:bg-red-600 hover:text-white text-red-600 rounded-xl flex items-center justify-center transition-all border border-red-200" title="Purge Record">
                           <i class="fas fa-trash-alt text-[10px]"></i>
                         </button>
                       </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        
        @if(hasMore() && !searchQuery()) {
          <div class="p-8 text-center bg-gray-50/50">
            <button (click)="loadMore()" class="px-8 py-3 bg-white border-2 border-black/5 hover:border-black text-black font-bold rounded-2xl text-sm transition-all shadow-sm hover:shadow-lg">
              Show more records
            </button>
            <p class="text-xs text-gray-400 mt-3 font-medium">Viewing {{ users().length }} of {{ allUsers.length }} total entries</p>
          </div>
        }
      </div>
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
  selectedUser = signal<any>(null);

  // FIX (38/P1): Pagination to avoid loading ALL users at once
  readonly PAGE_SIZE = 50;
  currentPage = signal(0);
  hasMore = signal(false);
  allUsers: User[] = []; // Full list in memory for search (public for template access)

  // FIX (39): filteredUsers is now a computed() signal — no more re-run on every CD cycle
  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const source = query ? this.allUsers : this.users();
    if (!query) return this.users();
    return source.filter(u =>
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.id && u.id.toLowerCase().includes(query))
    );
  });

  proCount = computed(() => this.allUsers.filter(u => u.subscription === 'pro').length);
  totalInterviews = computed(() => this.allUsers.reduce((acc, u) => acc + (u.interviewsCount || 0), 0));

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
      // FIX (38/P1): Load all users into memory but display paginated
      const { query, limitToFirst, orderByKey } = await import('firebase/database');
      const dbRefNode = dbRef(database, 'users');
      const snap = await get(dbRefNode);
      if (snap.exists()) {
        const usersData = snap.val();
        const usersArray: User[] = [];
        for (let uid in usersData) {
          if (usersData.hasOwnProperty(uid)) {
            const userData = usersData[uid];
            // Skip tombstone-only deleted records from display
            if (!userData.deleted) {
              usersArray.push({ ...userData, id: uid });
            }
          }
        }
        this.allUsers = usersArray;
        // Show first PAGE_SIZE users by default
        this.users.set(usersArray.slice(0, this.PAGE_SIZE));
        this.hasMore.set(usersArray.length > this.PAGE_SIZE);
      } else {
        this.allUsers = [];
        this.users.set([]);
        this.hasMore.set(false);
      }
    } catch (error) {
      this.toastService.error("Failed to load users list.");
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  loadMore() {
    const next = this.currentPage() + 1;
    const start = next * this.PAGE_SIZE;
    const page = this.allUsers.slice(start, start + this.PAGE_SIZE);
    this.users.update(u => [...u, ...page]);
    this.currentPage.set(next);
    this.hasMore.set((next + 1) * this.PAGE_SIZE < this.allUsers.length);
  }

  userHistory = signal<any[]>([]);
  stateService = inject(StateService);

  async viewDetails(user: User) {
    this.router.navigate(['/dashboard/admin/user', user.id]);
  }

  async updateTier(user: User, newTier: string) {
    if (user.subscription === newTier) return;

    // FIX (40): Warn admin before silently resetting interviewsCount
    const confirmMsg = newTier === 'free'
      ? `Downgrade ${user.name} to Free? Their interview count will NOT be reset. Confirm?`
      : `Upgrade ${user.name} to Pro? This will set their maxInterviews to 10. Confirm?`;
    if (!confirm(confirmMsg)) return;

    try {
      const updates: any = {
        subscription: newTier,
        maxInterviews: newTier === 'pro' ? 10 : 2
        // FIX (40): Do NOT reset interviewsCount silently
      };
      await update(dbRef(database, `users/${user.id}`), updates);
      this.toastService.success(`Updated ${user.name} to ${newTier.toUpperCase()} successfully.`);
      this.loadUsers();
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

  async deleteUser(user: User) {
    if (!confirm(`Are you sure you want to permanently delete user ${user.name} (${user.email})? This action cannot be undone.`)) {
      return;
    }

    if (user.id === this.authService.currentUser()?.id) {
      this.toastService.error("You cannot delete your own admin account.");
      return;
    }

    try {
      // Instead of completely removing, leave a tombstone to prevent re-login
      const dbRefNode = dbRef(database, `users/${user.id}`);
      await set(dbRefNode, { deleted: true, email: user.email });
      this.users.update(list => list.filter(u => u.id !== user.id));
      this.toastService.success(`User ${user.name} has been deleted.`);
    } catch (err) {
      this.toastService.error("Failed to delete user.");
      console.error(err);
    }
  }
  async resetInterviewCount(user: User) {
    if (!confirm(`Reset interview count for ${user.name} to 0? This will allow them to start fresh.`)) return;
    try {
      await update(dbRef(database, `users/${user.id}`), { interviewsCount: 0 });
      this.users.update(list => list.map(u => u.id === user.id ? { ...u, interviewsCount: 0 } : u));
      this.toastService.success(`Interview count reset to 0 for ${user.name}.`);
    } catch (err) {
      this.toastService.error('Failed to reset interview count.');
    }
  }
}
