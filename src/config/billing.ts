export const billingPlans = {
  FREE: {
    name: "Free",
    description:
      "Essential tools for getting started.",

    price: 0,

    features: [
      "Dashboard overview",
      "Basic analytics",
      "Up to 3 team members",
      "Basic reports",
    ],

    limits: {
      teamMembers: 3,
      customers: 100,
      products: 50,
    },
  },

  PRO: {
    name: "Pro",
    description:
      "Advanced tools for growing teams.",

    price: 29,

    stripePriceId:
      process.env.STRIPE_PRO_PRICE_ID,

    features: [
      "Everything in Free",
      "Unlimited team members",
      "Unlimited customers",
      "Advanced analytics",
      "Advanced reports",
      "Data export",
      "Priority support",
    ],

    limits: {
      teamMembers: Infinity,
      customers: Infinity,
      products: Infinity,
    },
  },
} as const;
