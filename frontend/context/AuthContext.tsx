"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User as FirebaseUser,
    GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface UserProfile {
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    phoneNumber?: string;
    studentName?: string;
    studentClass?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: FirebaseUser | null;
    userProfile: UserProfile | null;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    saveProfile: (data: Partial<UserProfile>) => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    // Fetch existing profile from Firestore
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUserProfile(userDoc.data() as UserProfile);
                    } else {
                        // Profile doesn't exist yet, we'll let the OnboardingModal handle creation
                        setUserProfile(null);
                    }

                    localStorage.setItem('getschool_user_uid', currentUser.uid);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            } else {
                setUserProfile(null);
                localStorage.removeItem('getschool_user_uid');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const saveProfile = async (data: Partial<UserProfile>) => {
        if (!user) throw new Error("No user logged in");
        console.log("Saving user profile for:", user.uid, data);

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, data, { merge: true });
            console.log("Profile saved to Firestore.");

            setUserProfile(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error("Error saving profile:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loginWithGoogle, logout, saveProfile, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
