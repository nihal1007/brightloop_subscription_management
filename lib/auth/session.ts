import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "brightloop_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "brightloop-default-super-secret-dev-key-2026"
);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  customerId?: string | null;
}

/**
 * Validates password rules:
 * > 8 characters, at least one uppercase, at least one lowercase, at least one special character.
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length <= 8) {
    return {
      isValid: false,
      message: "Password must be longer than 8 characters.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter.",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter.",
    };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character.",
    };
  }
  return { isValid: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
