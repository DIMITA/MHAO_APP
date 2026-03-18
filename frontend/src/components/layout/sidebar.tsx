'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  CreditCard,
  Users,
  User,
  ShieldCheck,
  HardHat,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Role } from '@/types';

const clientLinks = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Mes projets', icon: FolderOpen },
  { href: '/dashboard/quotes', label: 'Devis reçus', icon: FileText },
  { href: '/dashboard/providers', label: 'Prestataires', icon: Users },
  { href: '/dashboard/profile', label: 'Mon profil', icon: User },
];

const providerLinks = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projets disponibles', icon: FolderOpen },
  { href: '/dashboard/quotes', label: 'Mes devis', icon: FileText },
  { href: '/dashboard/profile', label: 'Mon profil', icon: User },
];

const adminLinks = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projets', icon: FolderOpen },
  { href: '/dashboard/admin', label: 'Administration', icon: ShieldCheck },
  { href: '/dashboard/providers', label: 'Prestataires', icon: Users },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isClient, isProvider, isAdmin } = useAuth();

  const links = isAdmin ? adminLinks : isProvider ? providerLinks : clientLinks;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-xl text-primary-600"
            onClick={onClose}
          >
            <div className="bg-primary-500 rounded-lg p-1.5">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <span>MHAO</span>
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isActive ? 'text-primary-600' : 'text-gray-400',
                      )}
                    />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Role badge */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isAdmin ? 'bg-purple-500' : isProvider ? 'bg-secondary-500' : 'bg-primary-500',
              )}
            />
            {isAdmin ? 'Administrateur' : isProvider ? 'Prestataire' : 'Client'}
          </div>
        </div>
      </aside>
    </>
  );
}
