'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/services/db';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
    registerWithEmail: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    loginWithEmail: async () => { throw new Error('Not implemented'); },
    registerWithEmail: async () => { throw new Error('Not implemented'); },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Create/Update user profile in Firestore
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    uid: user.uid,
                    displayName: user.displayName || 'Usuario',
                    email: user.email,
                    photoURL: user.photoURL,
                    lastLogin: serverTimestamp()
                }, { merge: true });
            }
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const loginWithEmail = async (email: string, password: string) => {
        return await signInWithEmailAndPassword(auth, email, password);
    };

    const registerWithEmail = async (email: string, password: string) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, loginWithEmail, registerWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
