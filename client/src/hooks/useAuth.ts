import { useMutation } from "@tanstack/react-query";
import { login as loginApi, register as registerApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const { user, token, setAuth, logout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => loginApi(email, password),
    onSuccess: (data) => setAuth(data.user, data.token),
  });

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      registerApi(name, email, password),
    onSuccess: (data) => setAuth(data.user, data.token),
  });

  return {
    user,
    isAuthenticated: Boolean(token),
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
}
