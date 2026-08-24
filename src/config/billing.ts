export const billingPlans = {
  FREE: {
    name: "Free",
    slug: "free",
    description: "Essential tools for getting started.",
    monthlyPrice: 0,
    yearlyPrice: 0,
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
    slug: "pro",
    description: "Advanced tools for growing teams.",
    monthlyPrice: 29,
    yearlyPrice: 290,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
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

  BUSINESS: {
    name: "Business",
    slug: "business",
    description: "For larger organizations.",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "Everything in Pro",
      "Audit logs",
      "API access",
      "Priority onboarding",
      "Dedicated support",
    ],
    limits: {
      teamMembers: Infinity,
      customers: Infinity,
      products: Infinity,
    },
  },
} as const;
