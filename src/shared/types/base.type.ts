export type Pagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

export type BaseQueryParams = {
  page?: number;
  pageSize?: number;
  searchField?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
};
