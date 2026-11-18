'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUserDetail } from '@/hooks/useUserDetail';
import { UserStatus } from '@/types/user';
import {
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Clock,
  RefreshCw,
  AlertCircle,
  Power,
  User as UserIcon,
} from 'lucide-react';

interface UserDetailModalProps {
  userId: number | null;
  onClose: () => void;
  onStatusUpdated?: (userId: number, nextStatus: UserStatus) => void;
}

export function UserDetailModal({
  userId,
  onClose,
  onStatusUpdated,
}: UserDetailModalProps) {
  const { user, isLoading, error, isUpdatingStatus, refetch, updateStatus } =
    useUserDetail(userId);

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const nextStatus: UserStatus =
      user.status === 'active' ? 'inactive' : 'active';
    const success = await updateStatus(nextStatus);
    if (success && onStatusUpdated) {
      onStatusUpdated(user.id, nextStatus);
    }
  };

  return (
    <Modal
      isOpen={userId !== null}
      onClose={onClose}
      title="جزئیات کاربر"
      description={user ? `شناسه کاربری #${user.id}` : 'در حال بارگذاری...'}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6 py-2">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
          <Skeleton className="h-24 rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="py-8 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              خطا در بارگذاری اطلاعات کاربر
            </h4>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={refetch}
          >
            تلاش مجدد
          </Button>
        </div>
      )}

      {/* Success State with User Details */}
      {!isLoading && !error && user && (
        <div className="space-y-6">
          {/* Top Profile Banner */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-200 shrink-0 overflow-hidden">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-7 h-7" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-base">
                  {user.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {user.email}
                </p>
                <div className="mt-2">
                  <StatusBadge status={user.status} />
                </div>
              </div>
            </div>

            {/* Quick Status Toggle Button */}
            <Button
              size="sm"
              variant={user.status === 'active' ? 'danger' : 'primary'}
              isLoading={isUpdatingStatus}
              icon={<Power className="w-3.5 h-3.5" />}
              onClick={handleToggleStatus}
            >
              {user.status === 'active' ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
            </Button>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                <span>سمت کاری / نقش:</span>
              </div>
              <div className="font-semibold text-slate-800 text-sm">
                {user.role || 'عضو تیم'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                <span>شماره تماس:</span>
              </div>
              <div className="font-semibold text-slate-800 font-mono text-sm" dir="ltr">
                {user.phoneNumber || '-'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>ایمیل سازمانی:</span>
              </div>
              <div className="font-semibold text-slate-800 text-sm font-mono truncate" dir="ltr">
                {user.email}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>تاریخ ثبت‌نام:</span>
              </div>
              <div className="font-semibold text-slate-800 text-sm">
                {formatDate(user.createdAt)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 sm:col-span-2">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>آخرین به‌روزرسانی:</span>
              </div>
              <div className="font-semibold text-slate-800 text-sm">
                {formatDate(user.updatedAt)}
              </div>
            </div>
          </div>

          {/* Bio section if present */}
          {user.bio && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="text-slate-400 font-medium mb-1.5">
                درباره کاربر / بیوگرافی:
              </div>
              <p className="text-slate-700 leading-relaxed text-sm">
                {user.bio}
              </p>
            </div>
          )}

          {/* Footer close button */}
          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="md" onClick={onClose}>
              بستن
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
