'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle, Crown, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function BillingPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [currentPlan, setCurrentPlan] = useState<any>(null)

  useEffect(() => {
    fetchBillingData()
  }, [])

  async function fetchBillingData() {
    try {
      // Get subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          payments (
            id,
            amount,
            currency,
            status,
            payment_method,
            created_at
          )
        `)
        .eq('user_id', (session?.user as any)?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subData) {
        setSubscription(subData)
        setCurrentPlan(PLANS.find(p => p.id === (subData as any).plan))
      }

      // Get payment history
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', (session?.user as any)?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (paymentsData) {
        setPayments(paymentsData)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelSubscription() {
    if (!subscription?.stripe_subscription_id) return

    const confirmed = confirm('¿Estás seguro de que deseas cancelar tu suscripción? Perderás acceso a funcionalidades premium.')
    if (!confirmed) return

    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.stripe_subscription_id }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel')
      }

      alert('Suscripción cancelada exitosamente')
      fetchBillingData()
    } catch (error) {
      console.error('Cancel error:', error)
      alert('Error al cancelar la suscripción')
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, any> = {
      active: { variant: 'success', label: 'Activa' },
      canceling: { variant: 'warning', label: 'Cancelando' },
      past_due: { variant: 'danger', label: 'Pago atrasado' },
      canceled: { variant: 'secondary', label: 'Cancelada' },
      trialing: { variant: 'info', label: 'Período de prueba' },
    }
    return variants[status] || { variant: 'secondary', label: status }
  }

  if (loading) {
    return (
      <DashboardLayout userRole={session?.user.role as any}>
        <div className="flex items-center justify-center h-96">
          <Spinner size="xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={session?.user.role as any}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Facturación y Suscripción
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu plan y revisa tu historial de pagos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-dojo-red to-dojo-redDark text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Crown className="w-5 h-5" />
                      Plan Actual
                    </CardTitle>
                    <p className="text-white/80 mt-1">
                      {currentPlan?.name || 'Plan no encontrado'}
                    </p>
                  </div>
                  {subscription && (
                    <Badge
                      variant={getStatusBadge(subscription.status).variant as any}
                      className="bg-white/20 text-white border-white/30"
                    >
                      {getStatusBadge(subscription.status).label}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-white/70 text-sm">Precio</p>
                    <p className="text-2xl font-bold">
                      ${currentPlan?.price || 0} <span className="text-lg">/mes</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Estudiantes</p>
                    <p className="text-2xl font-bold">{currentPlan?.maxStudents || 0}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Próximo cobro</p>
                    <p className="text-lg font-semibold">
                      {subscription?.current_period_end
                        ? format(new Date(subscription.current_period_end), 'dd MMM', { locale: es })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Método de pago</p>
                    <p className="text-lg font-semibold">Visa •••• 4242</p>
                  </div>
                </div>

                {subscription?.status === 'trialing' && (
                  <div className="p-4 bg-white/10 rounded-lg border border-white/20 mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-semibold">
                        ¡Período de prueba de 7 días!
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-white/80">
                      Tu suscripción comenzará el{' '}
                      {subscription?.current_period_start
                        ? format(new Date(subscription.current_period_start), 'dd de MMMM', { locale: es })
                        : 'próximo ciclo'}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="secondary" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Cambiar plan
                  </Button>
                  {subscription?.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={handleCancelSubscription}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar suscripción
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-dojo-red" />
                  Historial de Pagos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay pagos registrados aún
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            payment.status === 'succeeded'
                              ? 'bg-green-100 text-green-600'
                              : payment.status === 'failed'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {payment.status === 'succeeded' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : payment.status === 'failed' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {payment.description || 'Pago de suscripción'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(payment.created_at), 'dd MMM yyyy', { locale: es })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            ${payment.amount} {payment.currency}
                          </p>
                          <Badge
                            variant={
                              payment.status === 'succeeded'
                                ? 'success'
                                : payment.status === 'failed'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {payment.status === 'succeeded'
                              ? 'Pagado'
                              : payment.status === 'failed'
                              ? 'Fallido'
                              : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Features */}
            <Card>
              <CardHeader>
                <CardTitle>Características de tu plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {currentPlan?.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Billing Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Facturación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{session?.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Método de pago</p>
                  <p className="font-medium">Terminado en 4242</p>
                  <Button variant="link" size="sm" className="p-0 h-auto">
                    Actualizar tarjeta
                  </Button>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Facturación</p>
                  <p className="font-medium"> Mensual, automática</p>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">¿Necesitas ayuda?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Contacta a nuestro equipo de soporte para cualquier duda sobre tu suscripción.
                    </p>
                    <Button variant="secondary" size="sm" className="mt-3">
                      Contactar soporte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Import plans
import { PLANS } from '@/lib/services/stripe'
