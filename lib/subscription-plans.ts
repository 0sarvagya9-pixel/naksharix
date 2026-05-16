export const subscriptionPlans = [
  { id: "PREMIUM", name: "Premium", amount: 499, interval: "month", credits: 100, features: ["Personalized horoscope", "Kundli PDF reports", "Tarot AI interpretation", "100 credits"] },
  { id: "VIP", name: "VIP", amount: 1499, interval: "month", credits: 400, features: ["Yearly AI report", "Consultation credits", "Priority support", "Advanced remedies"] }
] as const;

export type SubscriptionPlanId = (typeof subscriptionPlans)[number]["id"];
