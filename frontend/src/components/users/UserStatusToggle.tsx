'use client';

import React from 'react';
import { UserStatus } from '@/types/user';
import { Loader2, Power } from 'lucide-react';

interface UserStatusToggleProps {
  userId: number;
  currentStatus: UserStatus;
  isUpdating: boolean;
  onToggle: (id: number, nextStatus: UserStatus) => void;
  compact?: boolean;
}

export function UserStatusToggle({
  userId,
  currentStatus,
  isUpdating,
  onToggle,
  compact = false,
}: UserStatusToggleProps) {
  const nextStatus: UserStatus =
    currentStatus === 'active' ? 'inactive' : 'active';
  const isActive = currentStatus === 'active';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(userId, nextStatus);
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={isUpdating}
        title={isActive ? 'غیرفعال کردن کاربر' : 'فعال کردن کاربر'}
        className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${
          isActive
            ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300'
            : 'border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
        }`}
      >
        {isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
        ) : (
          <Power className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isUpdating}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      }`}
    >
      {isUpdating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Power className="w-3.5 h-3.5" />
      )}
      <span>{isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}</span>
    </button>
  );
}
