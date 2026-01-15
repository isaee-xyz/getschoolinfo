"use client";

import React, { useState } from 'react';
import { Search, Menu, Heart, Scale, User, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

import DistrictAutocomplete from './DistrictAutocomplete';

const Header: React.FC = () => {
  const router = useRouter();
  const { shortlist, compareList } = useStore();
  const { user, logout, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            G
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight hidden md:block">GetSchoolInfo</span>
        </Link>
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <DistrictAutocomplete />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4">

          <Link href="/compare" className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors" title="Compare Schools">
            <Scale className="w-6 h-6" />
            {compareList.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {compareList.length}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {isAuthenticated && user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 focus:outline-none">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700 hidden lg:block">{user.displayName || 'User'}</span>
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-gray-50">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-gray-50">
                  <Heart className="w-4 h-4" /> My Shortlist
                </Link>
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-2 text-slate-700 font-medium hover:text-blue-600">
              <User className="w-5 h-5" />
              <span className="text-sm">Login</span>
            </Link>
          )}

          <button className="md:hidden text-slate-700">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;