import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models';
import { initializeApp } from 'firebase/app';
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

const app = initializeApp(firebaseConfig);
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

    constructor() {
        onAuthStateChanged(auth, async (firebaseUser) => {
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
                            name: userData.name || firebaseUser.displayName || 'User'
                        });
                    } else {
                        // Fallback if DB record doesn't exist
                        this.currentUser.set({
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            password: '',
                            name: firebaseUser.displayName || 'User'
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
    }

    async signup(user: Omit<User, 'id'>): Promise<boolean> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);

            // Set display name in Auth
            await updateProfile(userCredential.user, {
                displayName: user.name
            });

            // Store user in Realtime Database
            await set(ref(database, 'users/' + userCredential.user.uid), {
                name: user.name,
                email: user.email
            });

            return true;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async login(email: string, pass: string): Promise<boolean> {
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
