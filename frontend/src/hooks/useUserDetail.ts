'use client';

import { useCallback, useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { UserDetail, UserStatus } from '@/types/user';

export function useUserDetail(userId: number | null) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await userService.getUserById(userId);
      setUser(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'خطا در دریافت اطلاعات کاربر';
      setError(msg);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const updateStatus = async (newStatus: UserStatus) => {
    if (!user) return false;
    setIsUpdatingStatus(true);
    try {
      const updated = await userService.updateUserStatus(user.id, newStatus);
      setUser(updated);
      return true;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'خطا در بروزرسانی وضعیت';
      setError(msg);
      return false;
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    isUpdatingStatus,
    refetch: fetchDetail,
    updateStatus,
  };
}
