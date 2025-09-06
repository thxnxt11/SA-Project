// src/api/auth.ts

export interface SignUpPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  age: number;
  birthday: string; // "YYYY-MM-DD"
  phonenum: string;
  gender_id: number;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse {
  token_type: string;
  token: string;
  id: number;
}

export interface ForgetPasswordPayload {
  email: string;
}

export interface ForgetPasswordResponse {
  message: string;
  token?: string; // Remove in production
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

const BASE = "http://localhost:8000";

export async function signUp(payload: SignUpPayload): Promise<void> {
  const res = await fetch(`${BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
}

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  const res = await fetch(`${BASE}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export async function forgetPassword(
  payload: ForgetPasswordPayload
): Promise<ForgetPasswordResponse> {
  const res = await fetch(`${BASE}/forget-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
  const res = await fetch(`${BASE}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}