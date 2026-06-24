import { redirect } from "next/navigation";
import { createAdminSession, validateAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request): Promise<never> {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!validateAdminPassword(password)) {
    redirect("/admin/login?error=invalid");
  }

  await createAdminSession();
  redirect("/admin");
}
