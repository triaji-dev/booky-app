import api from '../api/client';
import type {
  AdminOverview,
  AdminLoan,
  AdminUser,
  CreateLoanRequest,
  UpdateLoanRequest,
  CreateAuthorRequest,
  UpdateAuthorRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateBookRequest,
  AdminPaginatedResponse,
  ApiResponse,
} from '../types/adminTypes';

class AdminApiService {
  // Dashboard
  async getOverview(): Promise<AdminOverview> {
    const response = await api.get('/api/admin/overview');
    const data = response?.data ?? response;

    const profileResponse = await api.get('/api/me');
    const profileData = profileResponse?.data ?? profileResponse;

    return {
      totals: {
        users: data?.totalUsers ?? 0,
        books: data?.totalBooks ?? 0,
      },
      loans: {
        active: data?.totalLoans ?? 0,
        overdue: data?.overdueLoans ?? 0,
      },
      topBorrowed: data?.topBorrowed ?? [],
      admin: {
        name: profileData?.profile?.name ?? 'Admin',
        email: profileData?.profile?.email ?? '',
        role: profileData?.profile?.role ?? 'ADMIN',
        profilePhoto: profileData?.profile?.profilePhoto ?? null,
      },
    };
  }

  // Overdue Loans
  async getOverdueLoans(
    page: number = 1,
    limit: number = 10
  ): Promise<AdminPaginatedResponse<AdminLoan>> {
    const response = await api.get('/api/admin/loans', {
      params: { status: 'overdue', page, limit },
    });
    const data = response?.data ?? response;
    return {
      data: data?.loans ?? [],
      meta: {
        page,
        limit,
        total: data?.pagination?.total ?? 0,
        totalPages: data?.pagination?.totalPages ?? 1,
      },
    };
  }

  // Loans CRUD
  async createLoan(data: CreateLoanRequest): Promise<ApiResponse<AdminLoan>> {
    const response = await api.post('/api/admin/loans', data);
    return response as unknown as ApiResponse<AdminLoan>;
  }

  async updateLoan(
    loanId: number,
    data: UpdateLoanRequest
  ): Promise<ApiResponse<AdminLoan>> {
    const response = await api.patch(`/api/admin/loans/${loanId}`, data);
    return response as unknown as ApiResponse<AdminLoan>;
  }

  // Authors CRUD
  async getAuthors(): Promise<ApiResponse<CreateAuthorRequest[]>> {
    const response = await api.get('/api/authors');
    const data = response?.data ?? response;
    const authors = Array.isArray(data) ? data : data?.authors ?? [];
    return { success: true, message: 'OK', data: authors };
  }

  async createAuthor(
    data: CreateAuthorRequest
  ): Promise<any> {
    const response = await api.post('/api/authors', data);
    return response;
  }

  async updateAuthor(
    authorId: number,
    data: UpdateAuthorRequest
  ): Promise<ApiResponse<CreateAuthorRequest>> {
    const response = await api.put(`/api/authors/${authorId}`, data);
    return response as unknown as ApiResponse<CreateAuthorRequest>;
  }

  async deleteAuthor(authorId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/api/authors/${authorId}`);
    return response as unknown as ApiResponse<void>;
  }

  // Categories CRUD
  async getCategories(): Promise<ApiResponse<CreateCategoryRequest[]>> {
    const response = await api.get('/api/categories');
    const data = response?.data ?? response;
    const categories = Array.isArray(data) ? data : data?.categories ?? [];
    return { success: true, message: 'OK', data: categories };
  }

  async createCategory(
    data: CreateCategoryRequest
  ): Promise<ApiResponse<CreateCategoryRequest>> {
    const response = await api.post('/api/categories', data);
    return response as unknown as ApiResponse<CreateCategoryRequest>;
  }

  async updateCategory(
    categoryId: number,
    data: UpdateCategoryRequest
  ): Promise<ApiResponse<CreateCategoryRequest>> {
    const response = await api.put(`/api/categories/${categoryId}`, data);
    return response as unknown as ApiResponse<CreateCategoryRequest>;
  }

  async deleteCategory(categoryId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/api/categories/${categoryId}`);
    return response as unknown as ApiResponse<void>;
  }

  // Books CRUD
  async createBook(data: CreateBookRequest): Promise<ApiResponse<unknown>> {
    const response = await api.post('/api/books', data);
    return response as unknown as ApiResponse<unknown>;
  }

  async getBookById(bookId: number): Promise<any> {
    const response = await api.get(`/api/books/${bookId}`);
    const data = (response as any)?.data ?? response;
    return data;
  }

  async updateBook(
    bookId: number,
    data: CreateBookRequest
  ): Promise<ApiResponse<unknown>> {
    const response = await api.put(`/api/books/${bookId}`, data);
    return response as unknown as ApiResponse<unknown>;
  }

  async deleteBook(bookId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/api/books/${bookId}`);
    return response as unknown as ApiResponse<void>;
  }

  // Combined dashboard data
  async getDashboardData(): Promise<{
    overview: AdminOverview;
    overdueLoans: AdminLoan[];
  }> {
    try {
      const [overviewResponse, overdueResponse] = await Promise.all([
        api.get('/api/admin/overview'),
        api.get('/api/admin/loans', {
          params: { status: 'overdue', page: 1, limit: 20 },
        }),
      ]);

      const overviewData = overviewResponse?.data ?? overviewResponse;
      const overdueData = overdueResponse?.data ?? overdueResponse;

      const overdueLoans = overdueData?.loans ?? [];

      // Fetch book details for overdue loans
      const loansWithBooks = await Promise.all(
        overdueLoans.map(async (loan: AdminLoan) => {
          if (loan.bookId && !loan.book) {
            try {
              const bookResponse = await api.get(`/api/books/${loan.bookId}`);
              const bookData = bookResponse?.data ?? bookResponse;
              return { ...loan, book: bookData };
            } catch (error) {
              console.error(`Error fetching book ${loan.bookId}:`, error);
              return loan;
            }
          }
          return loan;
        })
      );

      return {
        overview: {
          totals: {
            users: overviewData?.totalUsers ?? 0,
            books: overviewData?.totalBooks ?? 0,
          },
          loans: {
            active: overviewData?.totalLoans ?? 0,
            overdue: overviewData?.overdueLoans ?? 0,
          },
          topBorrowed: overviewData?.topBorrowed ?? [],
          admin: {
            name: 'Admin',
            email: '',
            role: 'ADMIN',
            profilePhoto: null,
          },
        },
        overdueLoans: loansWithBooks,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Users
  async getUsers(params?: {
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminPaginatedResponse<AdminUser>> {
    const response = await api.get('/api/admin/users', { params });
    const data = response?.data ?? response;
    return {
      data: data?.users ?? [],
      meta: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        total: data?.pagination?.total ?? 0,
        totalPages: data?.pagination?.totalPages ?? 1,
      },
    };
  }

  // All loans (admin view)
  async getLoans(params?: {
    status?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminPaginatedResponse<AdminLoan>> {
    const response = await api.get('/api/admin/loans', { params });
    const data = response?.data ?? response;
    return {
      data: data?.loans ?? [],
      meta: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        total: data?.pagination?.total ?? 0,
        totalPages: data?.pagination?.totalPages ?? 1,
      },
    };
  }
}

export const adminApiService = new AdminApiService();
export const adminApi = adminApiService;
