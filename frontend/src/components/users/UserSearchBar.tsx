'use client';

import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface UserSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function UserSearchBar({
  value,
  onChange,
  isLoading = false,
}: UserSearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="جستجو بر اساس نام یا ایمیل..."
        className="w-full pr-10 pl-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
      />

      <div className="absolute inset-y-0 left-0 pl-3 flex items-center gap-1.5">
        {isLoading && (
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="پاک کردن جستجو"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
