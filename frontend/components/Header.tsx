"use client";

import React, { useState } from 'react';
import { Menu, Heart, Scale, User, LogOut, LayoutDashboard, X, Database, Info, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';
import { LogoMark } from './Logo';

const Header: React.FC = () => {
  const router = useRouter();
  const { shortlist, compareList } = useStore();
  const { user, logout, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-50" style={{ borderColor: 'var(--gsi-border)' }}>
        {/* Main row: Logo + Search (desktop) + Actions */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <LogoMark size={28} variant="default" />
            <div className="flex items-center gap-2">
              <span className="text-[15px] md:text-lg font-bold tracking-tight font-display" style={{ color: 'var(--gsi-text)' }}>
                Get<span style={{ color: 'var(--gsi-primary)' }}>Schools</span>Info
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary-dark)' }}>
                <Database className="w-3 h-3" />
                UDISE+ Data
              </span>
            </div>
          </Link>

          {/* Search - Desktop: full-width global search */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <GlobalSearch />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Nav Links - Desktop */}
            <Link
              href="/how-it-works"
              className="hidden lg:flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-gsi-bg-warm"
              style={{ color: 'var(--gsi-text-secondary)' }}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              How It Works
            </Link>
            <Link
              href="/about-us"
              className="hidden lg:flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-gsi-bg-warm"
              style={{ color: 'var(--gsi-text-secondary)' }}
            >
              <Info className="w-3.5 h-3.5" />
              About
            </Link>

            {/* Compare */}
            <Link
              href={compareList.length > 0 ? `/compare?${compareList.map((id, i) => `id_${i + 1}=${id}`).join('&')}` : '/compare'}
              className="relative p-2 transition-colors rounded-lg hover:bg-gsi-bg-warm min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: 'var(--gsi-text-muted)' }}
              title="Compare Schools"
              aria-label={`Compare Schools${compareList.length > 0 ? ` (${compareList.length} selected)` : ''}`}
            >
              <Scale className="w-5 h-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center rounded-full"
                  style={{ background: 'var(--gsi-primary)' }}>
                  {compareList.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gsi-bg-warm transition-colors focus:outline-none">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border-2" style={{ borderColor: 'var(--gsi-border)' }} />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: 'var(--gsi-primary)' }}>
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden lg:block" style={{ color: 'var(--gsi-text)' }}>{user.displayName || 'User'}</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-52 bg-white py-1 border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right"
                  style={{ borderRadius: 'var(--gsi-radius-md)', borderColor: 'var(--gsi-border)', boxShadow: 'var(--gsi-shadow-lg)' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--gsi-border-light)' }}>
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--gsi-text)' }}>{user.displayName || 'User'}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--gsi-text-muted)' }}>{user.email}</p>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-gsi-bg-warm" style={{ color: 'var(--gsi-text-secondary)' }}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-gsi-bg-warm" style={{ color: 'var(--gsi-text-secondary)' }}>
                    <Heart className="w-4 h-4" /> My Shortlist
                  </Link>
                  <div className="border-t mt-1" style={{ borderColor: 'var(--gsi-border-light)' }}>
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-red-50" style={{ color: 'var(--gsi-danger)' }}>
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-gsi-bg-warm" style={{ color: 'var(--gsi-text-secondary)' }}>
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Toggle - only for secondary nav links */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg transition-colors hover:bg-gsi-bg-warm min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: 'var(--gsi-text-secondary)' }}
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - ALWAYS visible, not inside hamburger */}
        <div className="md:hidden px-4 pb-3">
          <GlobalSearch compact />
        </div>

        {/* Mobile Nav - only secondary links, no search */}
        {showMobileMenu && (
          <div className="md:hidden border-t p-4 bg-white animate-fade-in" style={{ borderColor: 'var(--gsi-border-light)' }}>
            <div className="flex flex-col gap-1">
              <Link
                href="/how-it-works"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 text-sm font-medium py-2.5 px-2 rounded-lg transition-colors active:bg-gsi-bg-warm"
                style={{ color: 'var(--gsi-text-secondary)' }}
              >
                <Lightbulb className="w-4 h-4" /> How It Works
              </Link>
              <Link
                href="/about-us"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 text-sm font-medium py-2.5 px-2 rounded-lg transition-colors active:bg-gsi-bg-warm"
                style={{ color: 'var(--gsi-text-secondary)' }}
              >
                <Info className="w-4 h-4" /> About
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-2 text-sm font-medium py-2.5 px-2 rounded-lg transition-colors active:bg-gsi-bg-warm"
                  style={{ color: 'var(--gsi-text-secondary)' }}
                >
                  <User className="w-4 h-4" /> Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
