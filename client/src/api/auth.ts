import { apiRequest } from "./http";

export type LoginRequest = { email: string; password: string };

export type AuthResponse = { token: string };

export function loginApi(body: LoginRequest) {
  return apiRequest<AuthResponse>("/auth/login", { method: "POST", body });
}
