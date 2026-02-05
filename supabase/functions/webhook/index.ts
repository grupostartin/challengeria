// @ts-nocheck
import { serve } from "std/http/server";
import Stripe from "stripe";
import { createClient } from "supabase";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req: Request) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    }

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const signature = req.headers.get("Stripe-Signature");
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            webhookSecret!,
            undefined,
            cryptoProvider
        );
    } catch (err: any) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
                const subscription = event.data.object;
                await supabase
                    .from("profiles")
                    .update({
                        subscription_status: subscription.status,
                        plan_type: "premium",
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        stripe_subscription_id: subscription.id,
                        stripe_customer_id: subscription.customer,
                    })
                    .eq("id", subscription.client_reference_id || (await getUserByEmail(supabase, subscription.customer_email))?.id);
                break;

            case "checkout.session.completed":
                const session = event.data.object;
                if (session.mode === 'subscription') {
                    // Sometimes better handled here if subscription event is delayed
                    // But usually subscription.created handles it.
                }
                break;
        }
    } catch (err: any) {
        console.error(err);
        return new Response(`Error processing webhook: ${err.message}`, { status: 500 });
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
    });
});

async function getUserByEmail(supabase: any, email: string) {
    if (!email) return null;
    const { data } = await supabase.from('profiles').select('id').eq('email', email).single();
    return data;
}
