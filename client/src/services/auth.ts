import { httpPost } from "./http";
import type { LoginRequest, LoginResponse } from "@shared/types/auth";

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return httpPost<LoginResponse>("/admin/login", payload);
}
