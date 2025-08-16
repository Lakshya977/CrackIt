import { headers } from "next/headers";
import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import stripe from "../utils/stripe";
import User from "../models/user.model";
export const createSubscription = catchAsyncErrors(
  async (email: string, paymentMethodId: string) => {
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
      items: [{ price: process.env.PRODUCT_ID! }],
      expand: ["latest_invoice.payment_intent"],
    });

    return { subscription };
  }
);

