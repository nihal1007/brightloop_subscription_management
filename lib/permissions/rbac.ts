import { SessionUser } from "@/lib/auth/session";

export type Role = "ADMIN" | "STAFF" | "CUSTOMER";

export interface PermissionCheck {
  allowed: boolean;
  error?: string;
  statusCode?: number;
}

export function requireAuth(user: SessionUser | null): PermissionCheck {
  if (!user) {
    return {
      allowed: false,
      error: "Authentication required. Please log in.",
      statusCode: 401,
    };
  }
  return { allowed: true };
}

export function requireAdmin(user: SessionUser | null): PermissionCheck {
  const authCheck = requireAuth(user);
  if (!authCheck.allowed) return authCheck;

  if (user?.role !== "ADMIN") {
    return {
      allowed: false,
      error: "Access denied. Administrator privileges required.",
      statusCode: 403,
    };
  }
  return { allowed: true };
}

export function requireStaffOrAdmin(user: SessionUser | null): PermissionCheck {
  const authCheck = requireAuth(user);
  if (!authCheck.allowed) return authCheck;

  if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
    return {
      allowed: false,
      error: "Access denied. Staff or Administrator privileges required.",
      statusCode: 403,
    };
  }
  return { allowed: true };
}

/**
 * Validates that the logged-in user is either Staff/Admin or the specific customer owning the resource.
 */
export function requireOwnershipOrStaff(
  user: SessionUser | null,
  resourceCustomerId: string
): PermissionCheck {
  const authCheck = requireAuth(user);
  if (!authCheck.allowed) return authCheck;

  if (user?.role === "ADMIN" || user?.role === "STAFF") {
    return { allowed: true };
  }

  if (user?.role === "CUSTOMER") {
    if (!user.customerId || user.customerId !== resourceCustomerId) {
      return {
        allowed: false,
        error: "Access denied. You do not have permission to view or modify another customer's resources.",
        statusCode: 403,
      };
    }
    return { allowed: true };
  }

  return {
    allowed: false,
    error: "Unauthorized access.",
    statusCode: 403,
  };
}
