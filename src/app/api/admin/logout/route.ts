import { redirect } from "next/navigation";
import { assertSameOrigin, clearAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request): Promise<never> {
  assertSameOrigin(request);
  await clearAdminSession();
  redirect("/admin/login");
}
