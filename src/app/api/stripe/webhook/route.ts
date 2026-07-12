import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER!]: "starter",
  [process.env.STRIPE_PRICE_PRO!]:     "pro",
  [process.env.STRIPE_PRICE_ELITE!]:   "elite",
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalide." }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabaseId = session.metadata?.supabase_id;
    if (!supabaseId || !session.subscription) return NextResponse.json({ ok: true });

    const sub = await stripe.subscriptions.retrieve(session.subscription as string) as unknown as { id: string; items: { data: { price: { id: string } }[] }; current_period_end: number };
    const priceId = sub.items.data[0]?.price.id;
    const plan = PRICE_TO_PLAN[priceId] ?? "gratuit";
    const fin = new Date(sub.current_period_end * 1000).toISOString();

    await supabase.from("coaches").update({
      abonnement: plan,
      stripe_subscription_id: sub.id,
      abonnement_fin: fin,
    }).eq("id", supabaseId);
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as unknown as { customer: string; items: { data: { price: { id: string } }[] }; current_period_end: number; status: string };
    const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
    const supabaseId = customer.metadata?.supabase_id;
    if (!supabaseId) return NextResponse.json({ ok: true });

    const priceId = sub.items.data[0]?.price.id;
    const plan = PRICE_TO_PLAN[priceId] ?? "gratuit";
    const fin = new Date(sub.current_period_end * 1000).toISOString();
    const actif = sub.status === "active";

    await supabase.from("coaches").update({
      abonnement: actif ? plan : "gratuit",
      abonnement_fin: actif ? fin : null,
    }).eq("id", supabaseId);
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as unknown as { customer: string };
    const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
    const supabaseId = customer.metadata?.supabase_id;
    if (!supabaseId) return NextResponse.json({ ok: true });

    await supabase.from("coaches").update({
      abonnement: "gratuit",
      stripe_subscription_id: null,
      abonnement_fin: null,
    }).eq("id", supabaseId);
  }

  return NextResponse.json({ ok: true });
}
