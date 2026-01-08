"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User as FirebaseUser,
    GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface UserProfile {
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    phoneNumber?: string;
    studentName?: string;
    studentClass?: string;
    onboardingStatus?: 'pending' | 'completed';
    environment?: string;
    lastLoginAt?: any;
    metadata?: {
        userAgent: string;
        platform: string;
        language: string;
    };
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
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    let profileData = userDoc.exists() ? (userDoc.data() as UserProfile) : {};

                    // Prepare metadata and tracking info
                    const updateData: Partial<UserProfile> = {
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        lastLoginAt: serverTimestamp(),
                        environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
                        metadata: {
                            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                            language: typeof navigator !== 'undefined' ? navigator.language : '',
                            platform: typeof navigator !== 'undefined' ? navigator.platform : '',
                        }
                    };

                    // If new user (doc doesn't exist) or no status, set as pending
                    if (!userDoc.exists() || !profileData.onboardingStatus) {
                        updateData.onboardingStatus = 'pending';
                    }

                    // Save/Update strictly to Firestore immediately to capture partial signup
                    await setDoc(userDocRef, updateData, { merge: true });

                    // Update local state (merge with existing data)
                    setUserProfile({ ...profileData, ...updateData });

                    localStorage.setItem('getschool_user_uid', currentUser.uid);
                } catch (error) {
                    console.error("Error fetching/saving user profile:", error);
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
