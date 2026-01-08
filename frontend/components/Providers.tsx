"use client";

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';

import { OnboardingModal } from './OnboardingModal';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <StoreProvider>
                {children}
                <OnboardingModal />
            </StoreProvider>
        </AuthProvider>
    );
}
