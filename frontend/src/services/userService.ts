import { apiClient } from '@/lib/api-client';
import {
  PaginatedUsersResponse,
  UserDetail,
  UserStatus,
} from '@/types/user';

export const userService = {
  /**
   * Fetches paginated user list with optional search query
   */
  async getUsers(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginatedUsersResponse> {
    return apiClient<PaginatedUsersResponse>('/api/v1/users', {
      method: 'GET',
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search,
      },
    });
  },

  /**
   * Fetches single user details by ID
   */
  async getUserById(id: number): Promise<UserDetail> {
    return apiClient<UserDetail>(`/api/v1/users/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Updates user status (active | inactive)
   */
  async updateUserStatus(
    id: number,
    status: UserStatus
  ): Promise<UserDetail> {
    return apiClient<UserDetail>(`/api/v1/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
