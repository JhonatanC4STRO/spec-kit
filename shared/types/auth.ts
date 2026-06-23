export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresInSeconds: number;
}

export interface TokenPayload {
  adminId: string;
  iat: number;
  exp: number;
}
