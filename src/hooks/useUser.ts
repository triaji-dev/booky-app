import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApi } from '../lib/api';
import type { UpdateProfileRequest } from '../lib/types';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const response = await userApi.getProfile();
      const data = response?.data ?? response;
      return {
        profile: data?.profile ?? null,
        loanStats: data?.loanStats ?? { borrowed: 0, late: 0, returned: 0, total: 0 },
        reviewsCount: data?.reviewsCount ?? 0,
      };
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil berhasil diperbarui!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Gagal memperbarui profil';
      toast.error(message);
    },
  });
};

export const useMyReviews = () => {
  return useQuery({
    queryKey: ['reviews', 'my'],
    queryFn: async () => {
      const response = await userApi.getMyReviews();
      const data = response?.data ?? response;
      return Array.isArray(data) ? data : data?.reviews ?? [];
    },
  });
};
