import { apiClient } from "./client";
import type { User } from "../types";

interface AuthResponse {
  user: User;
  token: string;
}

export type OtpPurpose = "verify-email" | "reset-password";

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ email: string; message: string }> {
  const { data } = await apiClient.post<{ email: string; message: string }>("/auth/register", {
    name,
    email,
    password,
  });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function verifyEmail(email: string, code: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/verify-email", { email, code });
  return data;
}

export async function resendOtp(email: string, purpose: OtpPurpose): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/auth/resend-otp", { email, purpose });
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/auth/reset-password", {
    email,
    code,
    newPassword,
  });
  return data;
}
