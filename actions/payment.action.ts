"use server"

import {
  cancelSubscription,
  createSubscription,
} from "@/backend/controller/payment.controller";

export async function createNewSubscription(
  email: string,
  paymentMethodId: string
) {
  return await createSubscription(email, paymentMethodId);
}

export async function cancelUserSubscription(email: string) {
  return await cancelSubscription(email);
}