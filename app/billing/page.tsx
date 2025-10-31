'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreditCard, AlertCircle, Check, Zap, TrendingUp, Calendar, Download, Crown, Loader2, ArrowRight, Settings } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'

interface BillingPageProps {
  user: User
}

interface Subscription {
  id: string
  user_id: string
  tier: 'free' | 'premium'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

interface PaymentMethod {
  id: string
  user_id: string
  stripe_payment_method_id: string
  brand: string
  last4: string
  exp_month: number
  exp_year: number
  is_default: boolean
  created_at: string
}

interface Invoice {
  id: string
  user_id: string
  stripe_invoice_id: string
  amount: number
  currency: string
  status: 'paid' | 'open' | 'void' | 'uncollectible'
  invoice_pdf: string | null
  period_start: string
  period_end: string
  created_at: string
}

interface UsageStats {
  applications_count: number
  applications_limit: number
  ai_analyses_used: number
}

export default function BillingPage({ user }: BillingPageProps) {
  const supabase = createClient()
  
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    fetchBillingData()
  }, [user.id])

  const fetchBillingData = async () => {
    try {
      setLoading(true)

      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (subError && subError.code !== 'PGRST116') throw subError
      setSubscription(subData)

      // Fetch payment method
      const { data: pmData, error: pmError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single()

      if (pmError && pmError.code !== 'PGRST116') throw pmError
      setPaymentMethod(pmData)

      // Fetch invoices
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (invoiceError) throw invoiceError
      setInvoices(invoiceData || [])

      // Fetch usage stats
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)

      if (appsError) throw appsError

      const applicationsCount = appsData?.length || 0
      const applicationsLimit = subData?.tier === 'premium' ? 999 : 10
      
      setUsage({
        applications_count: applicationsCount,
        applications_limit: applicationsLimit,
        ai_analyses_used: applicationsCount
      })

    } catch (error: any) {
      console.error('Error fetching billing data:', error)
      toast.error('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeToPremium = async () => {
    setActionLoading(true)
    try {
      // Call your Stripe checkout endpoint
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID
        })
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      toast.error('Failed to start checkout process')
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription?.stripe_subscription_id
        })
      })

      if (response.ok) {
        toast.success('Subscription will be canceled at the end of the billing period')
        await fetchBillingData()
        setShowCancelModal(false)
      }
    } catch (error: any) {
      toast.error('Failed to cancel subscription')
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription?.stripe_subscription_id
        })
      })

      if (response.ok) {
        toast.success('Subscription reactivated successfully!')
        await fetchBillingData()
      }
    } catch (error: any) {
      toast.error('Failed to reactivate subscription')
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleManagePaymentMethod = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subscription?.stripe_customer_id
        })
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      toast.error('Failed to open payment portal')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const isPremium = subscription?.tier === 'premium'
  const usagePercentage = usage ? (usage.applications_count / usage.applications_limit) * 100 : 0

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground text-lg">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Cancellation Warning */}
        {subscription?.cancel_at_period_end && (
          <div className="bg-destructive/10 border-2 border-destructive rounded-2xl p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Subscription Ending Soon
              </h3>
              <p className="text-muted-foreground mb-4">
                Your premium subscription will end on {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}. 
                You'll lose access to unlimited applications and premium features.
              </p>
              <button
                onClick={handleReactivateSubscription}
                disabled={actionLoading}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Reactivate Subscription'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Current Plan */}
        <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPremium ? 'bg-primary/10' : 'bg-muted'
              }`}>
                {isPremium ? (
                  <Crown className="w-6 h-6 text-primary" />
                ) : (
                  <Zap className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {isPremium ? 'Premium' : 'Free'} Plan
                </h2>
                <p className="text-muted-foreground">
                  {isPremium && subscription?.current_period_end
                    ? `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                    : 'Get started with basic features'}
                </p>
              </div>
            </div>

            {!isPremium && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Premium
              </button>
            )}
          </div>

          {/* Usage Stats */}
          {usage && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Applications Used</span>
                  <span className="text-sm text-muted-foreground">
                    {usage.applications_count} / {isPremium ? 'Unlimited' : usage.applications_limit}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercentage >= 90 ? 'bg-destructive' : usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>

              {!isPremium && usagePercentage >= 70 && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium mb-1">
                      You're running low on applications
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upgrade to Premium for unlimited applications and advanced features.
                    </p>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="text-sm text-primary font-semibold hover:underline"
                    >
                      Upgrade Now →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Method */}
        {isPremium && (
          <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Payment Method</h2>
              <button
                onClick={handleManagePaymentMethod}
                className="text-primary font-semibold hover:underline flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Manage
              </button>
            </div>

            {paymentMethod ? (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center border border-border">
                  <CreditCard className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground capitalize">
                    {paymentMethod.brand} •••• {paymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No payment method on file</p>
                <button
                  onClick={handleManagePaymentMethod}
                  className="text-primary font-semibold hover:underline"
                >
                  Add Payment Method
                </button>
              </div>
            )}
          </div>
        )}

        {/* Billing History */}
        {isPremium && invoices.length > 0 && (
          <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Billing History</h2>
            
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center border border-border">
                      <Calendar className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        ${(invoice.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                    
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-card rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Subscription */}
        {isPremium && !subscription?.cancel_at_period_end && (
          <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-2">Cancel Subscription</h2>
            <p className="text-muted-foreground mb-6">
              You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-destructive font-semibold hover:underline"
            >
              Cancel my subscription
            </button>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Upgrade to Premium</h2>
              <p className="text-muted-foreground">
                Unlock unlimited applications and all premium features
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Unlimited job applications</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Advanced AI analysis</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Priority interview prep</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Instant delete anytime</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-foreground">$12</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-muted transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgradeToPremium}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Upgrade Now
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Cancel Subscription?</h2>
              <p className="text-muted-foreground">
                You'll lose access to premium features at the end of your billing period on{' '}
                {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="space-y-3 mb-8 text-left">
              <p className="text-sm text-muted-foreground">You'll lose access to:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  <span className="text-sm">Unlimited applications</span>
                </div>
                <div className="flex items-center gap-2 text-destructive">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  <span className="text-sm">Advanced AI features</span>
                </div>
                <div className="flex items-center gap-2 text-destructive">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Keep Premium
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl border-2 border-destructive text-destructive font-semibold hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}