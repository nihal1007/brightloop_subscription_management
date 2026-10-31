import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/auth/session";
import {
  requireAuth,
  requireAdmin,
  requireStaffOrAdmin,
  requireOwnershipOrStaff,
} from "@/lib/permissions/rbac";

describe("Authentication & RBAC Security Rules", () => {
  describe("Password Complexity Validation", () => {
    it("should reject passwords with 8 characters or fewer", () => {
      expect(validatePassword("Pass1!").isValid).toBe(false);
      expect(validatePassword("Pass123!").isValid).toBe(false); // exactly 8 chars -> requires >8
    });

    it("should reject passwords without uppercase letter", () => {
      expect(validatePassword("password123!").isValid).toBe(false);
    });

    it("should reject passwords without lowercase letter", () => {
      expect(validatePassword("PASSWORD123!").isValid).toBe(false);
    });

    it("should reject passwords without special character", () => {
      expect(validatePassword("Password1234").isValid).toBe(false);
    });

    it("should accept compliant strong passwords (>8 chars, upper, lower, special)", () => {
      expect(validatePassword("BrightLoop@2026!").isValid).toBe(true);
    });
  });

  describe("Role-Based Access Control Guards", () => {
    const adminUser = {
      id: "u1",
      email: "admin@brightloop.io",
      name: "Admin",
      role: "ADMIN" as const,
    };
    const staffUser = {
      id: "u2",
      email: "staff@brightloop.io",
      name: "Staff",
      role: "STAFF" as const,
    };
    const customerUser = {
      id: "u3",
      email: "cust@client.com",
      name: "Customer",
      role: "CUSTOMER" as const,
      customerId: "cust-100",
    };

    it("requireAdmin should only permit ADMIN role", () => {
      expect(requireAdmin(adminUser).allowed).toBe(true);
      expect(requireAdmin(staffUser).allowed).toBe(false);
      expect(requireAdmin(customerUser).allowed).toBe(false);
      expect(requireAdmin(null).allowed).toBe(false);
    });

    it("requireStaffOrAdmin should permit ADMIN and STAFF roles", () => {
      expect(requireStaffOrAdmin(adminUser).allowed).toBe(true);
      expect(requireStaffOrAdmin(staffUser).allowed).toBe(true);
      expect(requireStaffOrAdmin(customerUser).allowed).toBe(false);
      expect(requireStaffOrAdmin(null).allowed).toBe(false);
    });

    it("requireOwnershipOrStaff should allow customers to access their own resources", () => {
      // Customer accessing own resource
      expect(requireOwnershipOrStaff(customerUser, "cust-100").allowed).toBe(true);
    });

    it("requireOwnershipOrStaff should block customers from accessing another customer's resources", () => {
      // Customer accessing someone else's resource
      const check = requireOwnershipOrStaff(customerUser, "cust-999");
      expect(check.allowed).toBe(false);
      expect(check.statusCode).toBe(403);
    });

    it("requireOwnershipOrStaff should allow staff and admins to access any customer resource", () => {
      expect(requireOwnershipOrStaff(adminUser, "cust-999").allowed).toBe(true);
      expect(requireOwnershipOrStaff(staffUser, "cust-999").allowed).toBe(true);
    });
  });
});
