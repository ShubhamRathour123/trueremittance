import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseProviderForm } from "@/lib/admin-validation";
import { prisma } from "@/lib/prisma";

function optionalString(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

export async function POST(request: Request): Promise<never> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  try {
    const formData = await request.formData();
    const parsed = parseProviderForm({
      name: formData.get("name"),
      slug: formData.get("slug"),
      websiteUrl: formData.get("websiteUrl"),
      affiliateUrl: formData.get("affiliateUrl"),
      isActive: formData.get("isActive") === "on"
    });

    await prisma.provider.upsert({
      where: { slug: parsed.slug },
      update: {
        name: parsed.name,
        websiteUrl: optionalString(parsed.websiteUrl),
        affiliateUrl: optionalString(parsed.affiliateUrl),
        isActive: parsed.isActive
      },
      create: {
        name: parsed.name,
        slug: parsed.slug,
        websiteUrl: optionalString(parsed.websiteUrl),
        affiliateUrl: optionalString(parsed.affiliateUrl),
        isActive: parsed.isActive
      }
    });
  } catch (error) {
    console.error("Unable to save provider", error);
    redirect("/admin?status=invalid-provider");
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}
