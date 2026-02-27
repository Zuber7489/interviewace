import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { User } from '../models';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { getDatabase, ref, set, get, child } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from '../firebase.config';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const database = getDatabase(app);
export const storage = getStorage(app);

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    currentUser = signal<User | null>(null);
    isLoggedIn = computed(() => !!this.currentUser());
    authInitialized = signal<boolean>(false);
    private ngZone = inject(NgZone);

    // --- Client-Side Rate Limiting ---
    private readonly MAX_AUTH_ATTEMPTS = 5;
    private readonly RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    private authAttempts: number[] = [];

    private checkRateLimit(): void {
        const now = Date.now();
        // Remove attempts that are outside the time window
        this.authAttempts = this.authAttempts.filter(t => now - t < this.RATE_LIMIT_WINDOW_MS);
        if (this.authAttempts.length >= this.MAX_AUTH_ATTEMPTS) {
            throw new Error('Too many attempts. Please wait 15 minutes before trying again.');
        }
        this.authAttempts.push(now);
    }

    // --- Input Sanitization ---
    private sanitizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    private sanitizeName(name: string): string {
        // Strip HTML tags to prevent XSS if name is ever rendered as HTML
        return name.replace(/<[^>]*>/g, '').trim().substring(0, 100);
    }

    constructor() {
        onAuthStateChanged(auth, async (firebaseUser) => {
            this.ngZone.run(async () => {
                if (firebaseUser) {
                    // Fetch user data from Realtime Database
                    const dbRef = ref(database);
                    try {
                        const snapshot = await get(child(dbRef, `users/${firebaseUser.uid}`));
                        if (snapshot.exists()) {
                            const userData = snapshot.val();
                            this.currentUser.set({
                                id: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                password: '', // Never store passwords in memory
                                name: userData.name || firebaseUser.displayName || 'User',
                                subscription: userData.subscription || 'free',
                                interviewsCount: userData.interviewsCount || 0,
                                maxInterviews: userData.maxInterviews || 2
                            });
                        } else {
                            // Fallback if DB record doesn't exist
                            this.currentUser.set({
                                id: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                password: '',
                                name: firebaseUser.displayName || 'User',
                                subscription: 'free',
                                interviewsCount: 0,
                                maxInterviews: 2
                            });
                        }
                    } catch (e) {
                        // silently ignore fetch errors in production
                    }
                } else {
                    this.currentUser.set(null);
                }
                this.authInitialized.set(true);
            });
        });
    }

    waitForAuth(): Promise<void> {
        return new Promise((resolve) => {
            if (this.authInitialized()) {
                resolve();
                return;
            }
            const checkInit = () => {
                if (this.authInitialized()) {
                    resolve();
                } else {
                    setTimeout(checkInit, 50);
                }
            };
            checkInit();
        });
    }

    async signup(user: Omit<User, 'id'>): Promise<boolean> {
        // Rate limiting check before any auth call
        this.checkRateLimit();
        this.authInitialized.set(false);

        const sanitizedEmail = this.sanitizeEmail(user.email);
        const sanitizedName = this.sanitizeName(user.name);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, user.password);

            // Set display name in Auth
            await updateProfile(userCredential.user, {
                displayName: sanitizedName
            });

            // Store user in Realtime Database with SaaS defaults
            await set(ref(database, 'users/' + userCredential.user.uid), {
                name: sanitizedName,
                email: sanitizedEmail,
                subscription: 'free',
                interviewsCount: 0,
                maxInterviews: 2
            });

            return true;
        } catch (error) {
            this.authInitialized.set(true); // Restore on error
            throw error;
        }
    }

    async login(email: string, pass: string): Promise<boolean> {
        // Rate limiting check before any auth call
        this.checkRateLimit();
        this.authInitialized.set(false);

        const sanitizedEmail = this.sanitizeEmail(email);

        try {
            await signInWithEmailAndPassword(auth, sanitizedEmail, pass);
            return true;
        } catch (error) {
            this.authInitialized.set(true); // Restore on error
            throw error;
        }
    }

    async logout(): Promise<void> {
        this.authInitialized.set(false);
        await signOut(auth);
        this.currentUser.set(null);
        // Securely wipe all localStorage data on logout to prevent
        // session data leakage on shared/public devices
        try {
            localStorage.clear();
        } catch (e) { /* ignore */ }
    }

    async resetPassword(email: string): Promise<void> {
        const sanitizedEmail = this.sanitizeEmail(email);
        await sendPasswordResetEmail(auth, sanitizedEmail);
    }
}
