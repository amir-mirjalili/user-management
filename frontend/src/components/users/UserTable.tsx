'use client';

import React from 'react';
import { UserListItem, UserStatus } from '@/types/user';
import { StatusBadge } from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { UserStatusToggle } from './UserStatusToggle';
import { Button } from '@/components/ui/Button';
import {
  AlertCircle,
  Eye,
  RefreshCw,
  SearchX,
  Users as UsersIcon,
} from 'lucide-react';

interface UserTableProps {
  users: UserListItem[];
  isLoading: boolean;
  error: string | null;
  updatingUserId: number | null;
  searchQuery: string;
  onSelectUser: (id: number) => void;
  onToggleStatus: (id: number, nextStatus: UserStatus) => void;
  onRetry: () => void;
  onClearSearch: () => void;
}

export function UserTable({
  users,
  isLoading,
  error,
  updatingUserId,
  searchQuery,
  onSelectUser,
  onToggleStatus,
  onRetry,
  onClearSearch,
}: UserTableProps) {
  // Format registration date nicely
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-right text-sm text-slate-600">
        <thead className="text-xs uppercase bg-slate-50/80 text-slate-500 border-b border-slate-200/80 select-none">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold">
              نام و نام خانوادگی
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              ایمیل
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              وضعیت
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              تاریخ ثبت‌نام
            </th>
            <th scope="col" className="px-6 py-4 font-semibold text-center">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {/* 1. Loading State */}
          {isLoading && (
            <>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </>
          )}

          {/* 2. Error State */}
          {!isLoading && error && (
            <tr>
              <td colSpan={5} className="px-6 py-14 text-center">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-base">
                    خطا در برقراری ارتباط با سرور
                  </h4>
                  <p className="text-xs text-slate-500">{error}</p>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                      onClick={onRetry}
                    >
                      تلاش مجدد
                    </Button>
                  </div>
                </div>
              </td>
            </tr>
          )}

          {/* 3. No Search Results State */}
          {!isLoading && !error && users.length === 0 && searchQuery && (
            <tr>
              <td colSpan={5} className="px-6 py-14 text-center">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <SearchX className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-base">
                    کاربری با عبارت «{searchQuery}» یافت نشد
                  </h4>
                  <p className="text-xs text-slate-500">
                    لطفاً عبارت دیگری را جستجو کنید یا فیلتر را پاک نمایید.
                  </p>
                  <div className="pt-2">
                    <Button size="sm" variant="secondary" onClick={onClearSearch}>
                      پاک کردن جستجو
                    </Button>
                  </div>
                </div>
              </td>
            </tr>
          )}

          {/* 4. Empty State (No users at all) */}
          {!isLoading && !error && users.length === 0 && !searchQuery && (
            <tr>
              <td colSpan={5} className="px-6 py-14 text-center">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                    <UsersIcon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-base">
                    هیچ کاربری در سیستم ثبت نشده است
                  </h4>
                  <p className="text-xs text-slate-500">
                    در حال حاضر لیستی از کاربران در دیتابیس وجود ندارد.
                  </p>
                  <div className="pt-2">
                    <Button size="sm" variant="outline" onClick={onRetry}>
                      بروزرسانی
                    </Button>
                  </div>
                </div>
              </td>
            </tr>
          )}

          {/* 5. Success State */}
          {!isLoading &&
            !error &&
            users.map((user) => {
              const initials = user.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('');

              return (
                <tr
                  key={user.id}
                  onClick={() => onSelectUser(user.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Name & Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        {initials}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          شناسه: #{user.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-700" dir="ltr">
                      {user.email}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>

                  {/* Created At */}
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <div
                      className="flex items-center justify-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* View details button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Eye className="w-3.5 h-3.5 text-indigo-600" />}
                        onClick={() => onSelectUser(user.id)}
                        title="مشاهده جزئیات کامل"
                      >
                        جزئیات
                      </Button>

                      {/* Status toggle button */}
                      <UserStatusToggle
                        userId={user.id}
                        currentStatus={user.status}
                        isUpdating={updatingUserId === user.id}
                        onToggle={onToggleStatus}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
