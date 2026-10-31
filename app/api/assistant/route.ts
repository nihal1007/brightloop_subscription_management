import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireStaffOrAdmin } from "@/lib/permissions/rbac";
import { askFinanceAssistant } from "@/services/ai-assistant-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const guard = requireStaffOrAdmin(user);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.error }, { status: guard.statusCode || 403 });
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const response = await askFinanceAssistant(prompt, user?.role);
    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Assistant query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
