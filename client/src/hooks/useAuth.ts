import { useMutation } from "@tanstack/react-query";
import {
  forgotPassword as forgotPasswordApi,
  login as loginApi,
  OtpPurpose,
  register as registerApi,
  resendOtp as resendOtpApi,
  resetPassword as resetPasswordApi,
  verifyEmail as verifyEmailApi,
} from "../api/auth.api";
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
  });

  const verifyEmailMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifyEmailApi(email, code),
    onSuccess: (data) => setAuth(data.user, data.token),
  });

  const resendOtpMutation = useMutation({
    mutationFn: ({ email, purpose }: { email: string; purpose: OtpPurpose }) => resendOtpApi(email, purpose),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => forgotPasswordApi(email),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) =>
      resetPasswordApi(email, code, newPassword),
  });

  return {
    user,
    isAuthenticated: Boolean(token),
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    verifyEmail: verifyEmailMutation.mutateAsync,
    isVerifyingEmail: verifyEmailMutation.isPending,
    resendOtp: resendOtpMutation.mutateAsync,
    isResendingOtp: resendOtpMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingForgotPassword: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    logout,
  };
}
