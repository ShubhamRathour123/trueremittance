import { redirect } from "next/navigation";
import { clearAdminSession } from "@/lib/admin-auth";

export async function POST(): Promise<never> {
  await clearAdminSession();
  redirect("/admin/login");
}
