'use client';

import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { UserTable } from '@/components/users/UserTable';
import { UserSearchBar } from '@/components/users/UserSearchBar';
import { UserPagination } from '@/components/users/UserPagination';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { UserStatus } from '@/types/user';
import { Users, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function UserManagementDashboard() {
  const {
    users,
    total,
    totalPages,
    page,
    limit,
    searchInput,
    debouncedSearch,
    isLoading,
    error,
    updatingUserId,
    setPage,
    setLimit,
    setSearchInput,
    refetch,
    updateStatus,
  } = useUsers();

  const { showToast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Status toggle handler with user feedback
  const handleToggleStatus = async (id: number, nextStatus: UserStatus) => {
    const success = await updateStatus(
      id,
      nextStatus,
      () => {
        showToast(
          `وضعیت کاربر به «${
            nextStatus === 'active' ? 'فعال' : 'غیرفعال'
          }» تغییر یافت.`,
          'success'
        );
      },
      (err) => {
        showToast(err.message || 'خطا در تغییر وضعیت کاربر', 'error');
      }
    );

    return success;
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                پنل مدیریت کاربران
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                سیستم یکپارچه مشاهده، جستجو و تغییر وضعیت کاربران
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>متصل به API سرور</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={refetch}
              disabled={isLoading}
            >
              به‌روزرسانی
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Header / Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              فهرست کاربران
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              مجموعاً {total} کاربر ثبت‌شده در پایگاه داده
            </p>
          </div>

          {/* Search Bar with Debounce */}
          <UserSearchBar
            value={searchInput}
            onChange={setSearchInput}
            isLoading={searchInput !== debouncedSearch}
          />
        </div>

        {/* Table & Pagination Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <UserTable
            users={users}
            isLoading={isLoading}
            error={error}
            updatingUserId={updatingUserId}
            searchQuery={debouncedSearch}
            onSelectUser={(id) => setSelectedUserId(id)}
            onToggleStatus={handleToggleStatus}
            onRetry={refetch}
            onClearSearch={() => setSearchInput('')}
          />

          <UserPagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* User Details Modal (Fetches GET /api/v1/users/:id) */}
      <UserDetailModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onStatusUpdated={(userId, nextStatus) => {
          showToast(
            `وضعیت کاربر به «${
              nextStatus === 'active' ? 'فعال' : 'غیرفعال'
            }» تغییر یافت.`,
            'success'
          );
          refetch();
        }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <UserManagementDashboard />
    </ToastProvider>
  );
}
