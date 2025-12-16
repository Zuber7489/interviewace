import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly USERS_KEY = 'interviewace_users';
    private readonly SESSION_KEY = 'interviewace_session';

    currentUser = signal<User | null>(this.loadSession());
    isLoggedIn = computed(() => !!this.currentUser());

    constructor() { }

    private loadSession(): User | null {
        const session = localStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }

    signup(user: Omit<User, 'id'>): boolean {
        const users = this.getUsers();
        if (users.some(u => u.email === user.email)) {
            return false; // Email exists
        }
        const newUser: User = { ...user, id: crypto.randomUUID() };
        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        this.login(user.email, user.password);
        return true;
    }

    login(email: string, pass: string): boolean {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === pass);
        if (user) {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
            this.currentUser.set(user);
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        this.currentUser.set(null);
    }

    private getUsers(): User[] {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : [];
    }
}
