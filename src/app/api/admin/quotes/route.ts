import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertSameOrigin, isAdminAuthenticated } from "@/lib/admin-auth";
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
  assertSameOrigin(request);

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
      sendAmount: formData.get("sendAmount"),
      deliverySpeed: formData.get("deliverySpeed"),
      sourceType: formData.get("sourceType"),
      sourceReference: formData.get("sourceReference"),
      verificationStatus: formData.get("verificationStatus"),
      isPromotional: formData.get("isPromotional") === "on",
      minimumAmount: formData.get("minimumAmount"),
      maximumAmount: formData.get("maximumAmount"),
      notes: formData.get("notes"),
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
        sendAmount: parsed.sendAmount,
        baseFee: parsed.baseFee,
        exchangeRate: parsed.exchangeRate,
        midMarketRate: parsed.midMarketRate,
        deliveryMethod: parsed.deliveryMethod,
        paymentMethod: parsed.paymentMethod,
        deliverySpeed: parsed.deliverySpeed,
        sourceType: parsed.sourceType,
        sourceReference: parsed.sourceReference,
        verificationStatus: parsed.verificationStatus,
        isPromotional: parsed.isPromotional,
        minimumAmount: parsed.minimumAmount,
        maximumAmount: parsed.maximumAmount,
        notes: parsed.notes,
        fetchedAt: new Date(),
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
