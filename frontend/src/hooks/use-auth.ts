import { useAuthStore } from '@/stores/auth.store';
import { Role } from '@/types';

export function useAuth() {
  const { user, accessToken, refreshToken, isAuthenticated, login, logout, updateUser } =
    useAuthStore();

  const isClient = user?.role === Role.CLIENT;
  const isProvider = user?.role === Role.PROVIDER;
  const isAdmin = user?.role === Role.ADMIN;

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isClient,
    isProvider,
    isAdmin,
    fullName,
    login,
    logout,
    updateUser,
  };
}
