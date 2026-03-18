'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getInitials } from '@/lib/utils';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, fullName } = useAuth();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notifications */}
      <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary-500 rounded-full" />
      </button>

      {/* User menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
              {user ? getInitials(user.firstName, user.lastName) : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-none">{fullName}</p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-48 rounded-xl bg-white shadow-lg border border-gray-200 p-1 mt-1 mr-2 animate-in fade-in-0 zoom-in-95"
            align="end"
          >
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-sm font-semibold text-gray-900">{fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <DropdownMenu.Item asChild>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer outline-none"
              >
                <User className="h-4 w-4 text-gray-400" />
                Mon profil
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 cursor-pointer outline-none"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}
