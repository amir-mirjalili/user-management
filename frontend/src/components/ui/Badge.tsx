import React from 'react';
import { UserStatus } from '@/types/user';

interface BadgeProps {
  status: UserStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: BadgeProps) {
  const isActive = status === 'active';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
          : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
        }`}
      />
      {isActive ? 'فعال' : 'غیرفعال'}
    </span>
  );
}
