import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import stripe from "../utils/stripe";
import User from "../models/user.model";

// Define the shape of the subscription data to return
interface SubscriptionData {
  id: string;
  status: string;
  customerId: string;
  created: number;
  startDate: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export const createSubscription = catchAsyncErrors(
  async (email: string, paymentMethodId: string) => {
    if (!email || !paymentMethodId) {
      throw new Error("Email and payment method ID are required");
    }

    await dbConnect();

    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a new subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer?.id,
      items: [{ price: "price_1RScpvRcrLP66hXNXJNhO67O" }],
    });

    // Return only serializable fields
    const subscriptionData: SubscriptionData = {
      id: subscription.id,
      status: subscription.status,
      customerId: subscription.customer as string,
      created: subscription.created,
      startDate: (subscription as any).current_period_start,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };

    return { subscription: subscriptionData };
  }
);

export const cancelSubscription = catchAsyncErrors(async (email: string) => {
  await dbConnect();

  const user = await User.findOne({ email });

  if (!user || !user.subscription?.id) {
    throw new Error("User or Subscription not found");
  }

  const subscription = await stripe.subscriptions.cancel(user.subscription.id);

  return { status: subscription.status };
});

export const subscriptionWebhook = async (req: Request) => {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") as string | undefined;

  if (!signature) {
    throw new Error("Missing stripe-signature header");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook error => ", error);
    throw new Error("Invalid webhook signature");
  }

  await dbConnect();

  switch (event.type) {
    case "invoice.payment_succeeded":
      const invoice = event.data.object;
      const email = invoice.customer_email;
      const customer = await stripe.customers.retrieve(invoice.customer as string);

      await User.findOneAndUpdate(
        { email },
        {
          subscription: {
            id: (invoice as any).subscription,
            customerId: customer?.id,
            status: "active",
            created: new Date(invoice.created * 1000),
            startDate: new Date(invoice?.lines?.data[0].period.start * 1000),
            currentPeriodEnd: new Date(invoice?.lines?.data[0].period.end * 1000),
          },
        }
      );
      break;
    case "invoice.payment_failed":
      const paymentFailed = event.data.object;
      const nextPaymentAttempt = paymentFailed.next_payment_attempt;

      await User.findOneAndUpdate(
        { "subscription.id": (paymentFailed as any).subscription },
        {
          subscription: {
            status: "past_due",
            nextPaymentAttempt: nextPaymentAttempt ? new Date(nextPaymentAttempt * 1000) : null,
          },
        }
      );
      break;
    case "customer.subscription.deleted":
      const subscriptionDeleted = event.data.object;

      await User.findOneAndUpdate(
        { "subscription.id": subscriptionDeleted.id },
        {
          subscription: {
            status: "canceled",
            nextPaymentAttempt: null,
          },
        }
      );
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
      break;
  }

  return { success: true };
};