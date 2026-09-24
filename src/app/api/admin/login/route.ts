import { redirect } from "next/navigation";
import {
  assertSameOrigin,
  clearFailedLogins,
  createAdminSession,
  getClientIp,
  isLoginRateLimited,
  recordFailedLogin,
  validateAdminPassword
} from "@/lib/admin-auth";

export async function POST(request: Request): Promise<never> {
  assertSameOrigin(request);

  const clientIp = getClientIp(request);

  if (isLoginRateLimited(clientIp)) {
    redirect("/admin/login?error=invalid");
  }

  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!validateAdminPassword(password)) {
    recordFailedLogin(clientIp);
    redirect("/admin/login?error=invalid");
  }

  clearFailedLogins(clientIp);
  await createAdminSession();
  redirect("/admin");
}
