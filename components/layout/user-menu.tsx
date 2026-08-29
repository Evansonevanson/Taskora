'use client';

import * as React from 'react';
import { LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { logoutUser } from '@/lib/actions/auth';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/lib/supabase/database.types';

export interface UserMenuProps {
  user: {
    id: string;
    email?: string | null;
    fullName?: string | null;
    role: UserRole;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLogout = async () => {
    await logoutUser();
  };

  const displayName = user.fullName || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full p-1 pl-2 text-stone-300 transition-colors hover:bg-stone-800/60 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
      >
        <Avatar name={displayName} size="sm" />
        <div className="hidden flex-col text-left md:flex">
          <span className="text-xs leading-tight font-semibold text-stone-200">
            {displayName}
          </span>
          <span className="text-[10px] text-stone-400 capitalize">
            {user.role}
          </span>
        </div>
        <ChevronDown className="mr-1 hidden h-3.5 w-3.5 text-stone-500 sm:block" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          className="animate-in fade-in-80 zoom-in-95 absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-stone-800 bg-stone-900/95 p-1.5 text-stone-100 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl duration-150"
        >
          {/* User Info Header */}
          <div className="mb-1 border-b border-stone-800/80 px-3 py-2.5">
            <p className="truncate text-xs font-semibold text-white">
              {displayName}
            </p>
            <p className="mb-1.5 truncate text-[11px] text-stone-400">
              {user.email}
            </p>
            <Badge
              variant={user.role === 'admin' ? 'primary' : 'secondary'}
              className="py-0.2 px-2 text-[10px]"
            >
              {user.role === 'admin' ? (
                <>
                  <Shield className="mr-1 h-2.5 w-2.5" />
                  <span>Admin</span>
                </>
              ) : (
                <>
                  <UserIcon className="mr-1 h-2.5 w-2.5" />
                  <span>Client</span>
                </>
              )}
            </Badge>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/40 hover:text-red-300"
            role="menuitem"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
