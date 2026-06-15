const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getCurrentPeriodEnd(subscription) {
  const timestamp =
    subscription.current_period_end ||
    subscription.items?.data?.[0]?.current_period_end ||
    null;

  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Méthode non autorisée",
    };
  }

  const signature = event.headers["stripe-signature"];

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature error:", error.message);
    return {
      statusCode: 400,
      body: `Webhook error: ${error.message}`,
    };
  }

  try {
    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object;

      const userId = session.metadata?.user_id;
      const subscriptionId = session.subscription;
      const customerId = session.customer;

      if (userId && subscriptionId) {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

        const { error } = await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: stripeSubscription.status,
            plan: "pro",
            current_period_end: getCurrentPeriodEnd(stripeSubscription),
          },
          {
            onConflict: "user_id",
          }
        );

        if (error) throw error;
      }
    }

    if (stripeEvent.type === "customer.subscription.updated") {
      const subscription = stripeEvent.data.object;

      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_end: getCurrentPeriodEnd(subscription),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) throw error;
    }

    if (stripeEvent.type === "customer.subscription.deleted") {
      const subscription = stripeEvent.data.object;

      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "canceled",
          current_period_end: null,
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error("Webhook handling error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};