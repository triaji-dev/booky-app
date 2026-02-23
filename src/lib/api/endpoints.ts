import api from './client';
import type {
  LoginRequest,
  RegisterRequest,
  BooksQueryParams,
  BorrowBookRequest,
  BorrowFromCartRequest,
  CreateReviewRequest,
  LoanFilters,
} from '../types';

// Auth
export const authApi = {
  login: (data: LoginRequest) =>
    api.post('/api/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post('/api/auth/register', data),
};

// Books
export const booksApi = {
  getBooks: (params?: BooksQueryParams) =>
    api.get('/api/books', { params }),

  getRecommendations: (params?: { page?: number; limit?: number }) =>
    api.get('/api/books/recommend', { params }),

  getBookById: (id: number) =>
    api.get(`/api/books/${id}`),

  createBook: (data: Record<string, unknown>) =>
    api.post('/api/books', data),

  updateBook: (id: number, data: Record<string, unknown>) =>
    api.put(`/api/books/${id}`, data),

  deleteBook: (id: number) =>
    api.delete(`/api/books/${id}`),
};

// Authors
export const authorsApi = {
  getAll: () =>
    api.get('/api/authors'),

  getPopular: () =>
    api.get('/api/authors/popular'),

  getAuthorBooks: (authorId: number) =>
    api.get(`/api/authors/${authorId}/books`),

  create: (data: { name: string; bio?: string; profilePhoto?: string }) =>
    api.post('/api/authors', data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/api/authors/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/authors/${id}`),
};

// Categories
export const categoriesApi = {
  getAll: () =>
    api.get('/api/categories'),

  create: (data: { name: string }) =>
    api.post('/api/categories', data),

  update: (id: number, data: { name: string }) =>
    api.put(`/api/categories/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/categories/${id}`),
};

// Reviews
export const reviewsApi = {
  getBookReviews: (bookId: number, params?: { page?: number; limit?: number }) =>
    api.get(`/api/reviews/book/${bookId}`, { params }),

  createReview: (data: CreateReviewRequest) =>
    api.post('/api/reviews', data),
};

// Cart
export const cartApi = {
  getCart: () =>
    api.get('/api/cart'),

  addItem: (bookId: number) =>
    api.post('/api/cart/items', { bookId }),

  removeItem: (itemId: number) =>
    api.delete(`/api/cart/items/${itemId}`),

  clearCart: () =>
    api.delete('/api/cart'),
};

// Loans
export const loansApi = {
  borrowBook: (data: BorrowBookRequest) =>
    api.post('/api/loans', data),

  borrowFromCart: (data: BorrowFromCartRequest) =>
    api.post('/api/loans/from-cart', data),

  getMyLoans: (params?: LoanFilters) =>
    api.get('/api/loans/my', { params }),

  returnBook: (loanId: number) =>
    api.patch(`/api/loans/${loanId}/return`),
};

// Profile / Me
export const userApi = {
  getProfile: () =>
    api.get('/api/me'),

  updateProfile: (data: { name?: string; phone?: string; profilePhoto?: string }) =>
    api.patch('/api/me', data),

  getMyReviews: () =>
    api.get('/api/me/reviews'),
};

// Admin
export const adminApi = {
  getOverview: () =>
    api.get('/api/admin/overview'),

  getUsers: (params?: { q?: string; page?: number; limit?: number }) =>
    api.get('/api/admin/users', { params }),

  getLoans: (params?: { status?: string; q?: string; page?: number; limit?: number }) =>
    api.get('/api/admin/loans', { params }),

  updateLoanStatus: (loanId: number, data: { status: string }) =>
    api.patch(`/api/admin/loans/${loanId}`, data),
};
