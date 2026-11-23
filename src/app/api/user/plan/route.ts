import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";

const updatePlanSchema = z.object({
  plan: z.enum(["free", "pro"]),
  billingCycle: z.enum(["monthly", "yearly"]).optional().default("monthly"),
  paymentMethod: z
    .enum(["click", "payme", "uzum", "telegram"])
    .optional()
    .default("click"),
});

const MONTHLY_PRICE_UZS = 149_000;
const YEARLY_MONTHLY_PRICE_UZS = 119_000;

export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json({
    authenticated: Boolean(session?.user),
    userEmail: session?.user?.email ?? null,
    userName: session?.user?.name ?? null,
    pricing: {
      monthlyUzs: MONTHLY_PRICE_UZS,
      yearlyMonthlyUzs: YEARLY_MONTHLY_PRICE_UZS,
      yearlyTotalUzs: YEARLY_MONTHLY_PRICE_UZS * 12,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = updatePlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Tarif ma'lumotlari noto'g'ri", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const { plan, billingCycle, paymentMethod } = parsed.data;

    const amountUzs =
      plan === "free"
        ? 0
        : billingCycle === "yearly"
          ? YEARLY_MONTHLY_PRICE_UZS * 12
          : MONTHLY_PRICE_UZS;

    const orderId = `3T-${plan.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json({
      ok: true,
      plan,
      billingCycle,
      paymentMethod,
      amountUzs,
      orderId,
      userEmail: session?.user?.email ?? null,
      activatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Tarifni yangilashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
