import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { booksApi, reviewsApi, authorsApi, loansApi } from '../lib/api';
import type { BooksQueryParams, BorrowBookRequest, CreateReviewRequest } from '../lib/types';

export const useBooks = (params?: BooksQueryParams) => {
  return useQuery({
    queryKey: ['books', params],
    queryFn: async () => {
      const response = await booksApi.getBooks(params);
      const data = response?.data ?? response;
      return {
        books: data?.books ?? [],
        pagination: data?.pagination ?? { totalPages: 1 },
      };
    },
  });
};

export const useBookById = (id: number) => {
  return useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const response = await booksApi.getBookById(id);
      return response?.data ?? response;
    },
    enabled: !!id,
  });
};

export const useBookRecommendations = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['books', 'recommendations', params],
    queryFn: async () => {
      const response = await booksApi.getRecommendations(params);
      const data = response?.data ?? response;
      return {
        books: data?.books ?? [],
        pagination: data?.pagination ?? { totalPages: 1 },
      };
    },
  });
};

export const useBookReviews = (bookId: number, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['reviews', bookId, params],
    queryFn: async () => {
      const response = await reviewsApi.getBookReviews(bookId, params);
      const data = response?.data ?? response;
      const reviews = Array.isArray(data) ? data : data?.reviews ?? [];
      return reviews;
    },
    enabled: !!bookId,
  });
};

export const useBorrowBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BorrowBookRequest) => loansApi.borrowBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Buku berhasil dipinjam!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Gagal meminjam buku';
      toast.error(message);
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewsApi.createReview(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
      toast.success('Review berhasil dikirim!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Gagal mengirim review';
      toast.error(message);
    },
  });
};

export const usePopularAuthors = (limit?: number) => {
  return useQuery({
    queryKey: ['authors', 'popular'],
    queryFn: async () => {
      const response = await authorsApi.getPopular();
      const data = response?.data ?? response;
      const authors = Array.isArray(data) ? data : data?.authors ?? [];
      return limit ? authors.slice(0, limit) : authors;
    },
  });
};

export const useAuthorBooks = (authorId: number) => {
  return useQuery({
    queryKey: ['author', authorId, 'books'],
    queryFn: async () => {
      const response = await authorsApi.getAuthorBooks(authorId);
      const data = response?.data ?? response;
      return {
        author: data?.author ?? null,
        books: data?.books ?? [],
      };
    },
    enabled: !!authorId,
  });
};

// Backward-compatible aliases used by existing pages
export const useBookDetail = (idStr: string) => {
  const numericId = parseInt(idStr, 10);
  return useBookById(numericId);
};

export const useAllBooks = (search?: string) => {
  const { data, ...rest } = useBooks({ limit: 12, q: search || undefined });
  return { data: data?.books ?? [], ...rest };
};

export const useAdminBooksWithStatus = () => {
  const { data, ...rest } = useBooks({ limit: 200 });
  const books = (data?.books ?? []).map((book: any) => ({
    ...book,
    status: book.availableCopies > 0 ? 'Available' : 'Borrowed',
  }));
  return { data: books, ...rest };
};
