import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { setCredentials, logout, setLoading } from '../store/slices/authSlice';
import { authApi } from '../lib/api';

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authApi.login(data),
    onMutate: () => {
      dispatch(setLoading(true));
    },
    onSuccess: (response: any) => {
      const payload = response?.data ?? response;
      const token = payload?.token;
      const user = payload?.user;

      if (token && user) {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(setCredentials({ token, user }));
        queryClient.clear();
        toast.success('Login berhasil!');
        navigate('/');
      } else {
        toast.error('Login gagal: respons tidak valid');
      }
    },
    onError: (error: any) => {
      const message = error?.message || 'Login gagal';
      toast.error(message);
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => authApi.register(data),
    onSuccess: () => {
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    },
    onError: (error: any) => {
      const message = error?.message || 'Registrasi gagal';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    dispatch(logout());
    queryClient.clear();
    navigate('/login');
    toast.success('Logout berhasil');
  };
};
