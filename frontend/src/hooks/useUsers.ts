'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';
import { userService } from '@/services/userService';
import { UserListItem, UserStatus } from '@/types/user';

interface UseUsersOptions {
  initialPage?: number;
  initialLimit?: number;
  debounceMs?: number;
}

export function useUsers({
  initialPage = 1,
  initialLimit = 10,
  debounceMs = 400,
}: UseUsersOptions = {}) {
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch = useDebounce(searchInput.trim(), debounceMs);

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track which user is currently being updated to show inline loading indicator
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.getUsers({
        page,
        limit,
        search: debouncedSearch || undefined,
      });

      setUsers(response.data || []);
      setTotal(response.total || 0);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'خطا در دریافت لیست کاربران';
      setError(errorMsg);
      setUsers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  // When search changes, reset page to 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Fetch on page, limit, or debouncedSearch change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Status update action
  const handleUpdateStatus = useCallback(
    async (
      id: number,
      newStatus: UserStatus,
      onSuccess?: () => void,
      onError?: (err: Error) => void
    ) => {
      setUpdatingUserId(id);
      try {
        const updated = await userService.updateUserStatus(id, newStatus);

        // Update local list state immediately with response
        setUsers((prev) =>
          prev.map((user) =>
            user.id === id ? { ...user, status: updated.status } : user
          )
        );

        if (onSuccess) onSuccess();
        return true;
      } catch (err: unknown) {
        const error =
          err instanceof Error
            ? err
            : new Error('خطا در تغییر وضعیت کاربر');
        if (onError) onError(error);
        return false;
      } finally {
        setUpdatingUserId(null);
      }
    },
    []
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
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
    refetch: fetchUsers,
    updateStatus: handleUpdateStatus,
  };
}
