// Common types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  profilePhoto?: string | null;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

// Book types
export interface Author {
  id: number;
  name: string;
  bio?: string | null;
  profilePhoto?: string | null;
  bookCount?: number;
  accumulatedScore?: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  description: string | null;
  isbn: string;
  publishedYear: number | null;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  authorId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  pages?: number;
  author?: Author;
  category?: Category;
  reviews?: Review[];
}

export type BookDetail = Book;

export interface BooksQueryParams {
  q?: string;
  categoryId?: number;
  authorId?: number;
  minRating?: number;
  page?: number;
  limit?: number;
}

// Review types
export interface Review {
  id: number;
  bookId: number;
  userId: number;
  star: number;
  comment?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: Pick<User, 'id' | 'name' | 'profilePhoto'>;
  book?: Pick<Book, 'id' | 'title' | 'coverImage' | 'author'>;
}

export interface CreateReviewRequest {
  bookId: number;
  star: number;
  comment?: string;
}

// Loan types
export interface Loan {
  id: number;
  bookId: number;
  userId: number;
  status: 'BORROWED' | 'LATE' | 'RETURNED';
  displayStatus?: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string | null;
  durationDays?: number;
  book?: Book;
  borrower?: User;
}

export interface BorrowBookRequest {
  bookId: number;
}

export interface BorrowFromCartRequest {
  itemIds: number[];
  borrowDate: string;
  borrowDuration: 3 | 5 | 10;
}

export interface LoanFilters {
  status?: 'all' | 'active' | 'returned' | 'overdue';
  q?: string;
  page?: number;
  limit?: number;
}

// Cart types
export interface CartItem {
  id: number;
  bookId: number;
  book?: Book;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  itemCount: number;
}

// Profile types
export interface LoanStats {
  borrowed: number;
  late: number;
  returned: number;
  total: number;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  profilePhoto?: string;
}
