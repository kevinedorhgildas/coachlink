import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { plan: planKey } = await req.json();
  if (!planKey) return NextResponse.json({ error: "Plan manquant." }, { status: 400 });

  const PRICE_IDS: Record<string, string> = {
    starter: process.env.STRIPE_PRICE_STARTER!,
    pro: process.env.STRIPE_PRICE_PRO!,
    elite: process.env.STRIPE_PRICE_ELITE!,
  };
  const priceId = PRICE_IDS[planKey];
  if (!priceId) return NextResponse.json({ error: "Plan invalide." }, { status: 400 });

  const { data: coach } = await supabase
    .from("coaches")
    .select("stripe_customer_id")
    .eq("id", userData.user.id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, nom")
    .eq("id", userData.user.id)
    .single();

  let customerId = (coach as Record<string, unknown>)?.stripe_customer_id as string | null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? undefined,
      name: profile?.nom ?? undefined,
      metadata: { supabase_id: userData.user.id },
    });
    customerId = customer.id;
    await supabase.from("coaches").update({ stripe_customer_id: customerId }).eq("id", userData.user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/coach/abonnement?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/tarifs`,
    metadata: { supabase_id: userData.user.id },
  });

  return NextResponse.json({ url: session.url });
}
