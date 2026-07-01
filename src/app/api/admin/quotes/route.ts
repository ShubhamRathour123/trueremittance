import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseQuoteForm } from "@/lib/admin-validation";
import { getAdminDashboardData } from "@/lib/data/providers";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAdminDashboardData();

  return NextResponse.json({
    latestQuotes: data.latestQuotes.map((quote) => ({
      ...quote,
      timestamp: quote.timestamp.toISOString()
    }))
  });
}

export async function POST(request: Request): Promise<never> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  try {
    const formData = await request.formData();
    const parsed = parseQuoteForm({
      providerId: formData.get("providerId"),
      corridorId: formData.get("corridorId"),
      baseFee: formData.get("baseFee"),
      exchangeRate: formData.get("exchangeRate"),
      midMarketRate: formData.get("midMarketRate"),
      deliveryMethod: formData.get("deliveryMethod"),
      paymentMethod: formData.get("paymentMethod")
    });

    const [provider, corridor] = await Promise.all([
      prisma.provider.findUnique({ where: { id: parsed.providerId }, select: { id: true } }),
      prisma.corridor.findUnique({ where: { id: parsed.corridorId }, select: { id: true } })
    ]);

    if (!provider || !corridor) {
      redirect("/admin?status=invalid-quote");
    }

    await prisma.rateQuote.create({
      data: {
        providerId: parsed.providerId,
        corridorId: parsed.corridorId,
        baseFee: parsed.baseFee,
        exchangeRate: parsed.exchangeRate,
        midMarketRate: parsed.midMarketRate,
        deliveryMethod: parsed.deliveryMethod,
        paymentMethod: parsed.paymentMethod,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error("Unable to save quote", error);
    redirect("/admin?status=invalid-quote");
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}
