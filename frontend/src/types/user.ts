export type UserStatus = 'active' | 'inactive';

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
}

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  role: string;
  phoneNumber: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUsersResponse {
  data: UserListItem[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface UserFilters {
  page: number;
  limit: number;
  search: string;
}
