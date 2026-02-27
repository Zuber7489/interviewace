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
                  <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
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
                    <td class="p-3">
                      <select [ngModel]="user.subscription || 'free'" (ngModelChange)="updateTier(user, $event)"
                        class="bg-transparent border border-gray-200 rounded px-2 py-1 text-xs font-bold focus:outline-none focus:border-black cursor-pointer uppercase">
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                      </select>
                    </td>
                    <td class="p-3 text-center">
                      <div class="flex items-center justify-center gap-2">
                         <button (click)="adjustInterviews(user, -1)" class="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs"><i class="fas fa-minus text-gray-600"></i></button>
                         <span class="font-bold w-6 text-center">{{ user.interviewsCount || 0 }}</span>
                         <button (click)="adjustInterviews(user, 1)" class="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs"><i class="fas fa-plus text-gray-600"></i></button>
                      </div>
                    </td>
                    <td class="p-3 text-center">
                      <input type="number" min="0" [ngModel]="user.subscription === 'pro' ? 10 : (user.maxInterviews || 2)" (change)="updateMaxInterviews(user, $event)"
                        class="w-16 text-center border border-gray-200 rounded px-1 py-1 text-xs font-bold focus:outline-none focus:border-black bg-transparent">
                    </td>
                    <td class="p-3 text-right">
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
