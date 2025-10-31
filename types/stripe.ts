// types/stripe.ts
import Stripe from 'stripe'

// Extended types for Stripe objects with additional properties
export interface StripeSubscriptionComplete extends Stripe.Subscription {
  current_period_start: number
  current_period_end: number
}

export interface StripeInvoiceComplete extends Stripe.Invoice {
  period_start: number
  period_end: number
}