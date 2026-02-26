import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { User } from '../models';
import { initializeApp, getApps, getApp } from 'firebase/app';
// ... existing imports ...
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
                                password: '', // Don't store or retrieve password
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
                        console.error("Error fetching user data", e);
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
            // If already initialized, resolve immediately
            if (this.authInitialized()) {
                resolve();
                return;
            }

            // Watch the signal for changes
            const checkInit = () => {
                if (this.authInitialized()) {
                    resolve();
                } else {
                    // Check again in the next microtask or after a short delay
                    // Since we are in a Promise, we can use a polling approach or better yet,
                    // just rely on the fact that any change to authInitialized will be caught by anyone watching it.
                    // However, to make this specific promise work:
                    setTimeout(checkInit, 50);
                }
            };
            checkInit();
        });
    }

    async signup(user: Omit<User, 'id'>): Promise<boolean> {
        this.authInitialized.set(false); // Reset to wait for the new state
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);

            // Set display name in Auth
            await updateProfile(userCredential.user, {
                displayName: user.name
            });

            // Store user in Realtime Database with SaaS defaults
            await set(ref(database, 'users/' + userCredential.user.uid), {
                name: user.name,
                email: user.email,
                subscription: 'free',
                interviewsCount: 0,
                maxInterviews: 2
            });

            return true;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async login(email: string, pass: string): Promise<boolean> {
        this.authInitialized.set(false); // Reset to wait for the new state
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            return true;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        await signOut(auth);
        this.currentUser.set(null);
    }

    async resetPassword(email: string): Promise<void> {
        await sendPasswordResetEmail(auth, email);
    }
}
