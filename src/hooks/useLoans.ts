import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { loansApi } from '../lib/api';
import type { LoanFilters } from '../lib/types';

export const useMyLoans = (params?: LoanFilters) => {
  return useQuery({
    queryKey: ['loans', 'my', params],
    queryFn: async () => {
      const response = await loansApi.getMyLoans(params);
      const data = response?.data ?? response;
      const loans = Array.isArray(data) ? data : data?.loans ?? [];
      const pagination = data?.pagination ?? { totalPages: 1 };
      return { loans, pagination };
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: number) => loansApi.returnBook(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Buku berhasil dikembalikan!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Gagal mengembalikan buku';
      toast.error(message);
    },
  });
};
