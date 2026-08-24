import Stripe from "stripe";

import { getPaymentSecretKey } from "@/lib/payments/env";

const secretKey = getPaymentSecretKey();

export const stripe = secretKey ? new Stripe(secretKey) : null;

