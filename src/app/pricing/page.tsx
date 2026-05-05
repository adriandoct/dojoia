'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Users, Crown, Zap, Star, ArrowRight } from 'lucide-react'
import { PLANS } from '@/lib/services/stripe'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId)

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/pricing?cancelled=true`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert('Error al procesar el pago: ' + error.message)
      setSelectedPlan(null)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'family_basic':
        return <Sparkles className="w-6 h-6 text-blue-500" />
      case 'family_plus':
        return <Users className="w-6 h-6 text-green-500" />
      case 'school':
        return <Crown className="w-6 h-6 text-purple-500" />
      case 'premium_sensei':
        return <Zap className="w-6 h-6 text-yellow-500" />
      default:
        return <Star className="w-6 h-6 text-gray-500" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'family_basic':
        return 'border-blue-200 hover:border-blue-400'
      case 'family_plus':
        return 'border-green-200 hover:border-green-400'
      case 'school':
        return 'border-purple-200 hover:border-purple-400'
      case 'premium_sensei':
        return 'border-yellow-200 hover:border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50'
      default:
        return 'border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4">
            <Sparkles className="w-4 h-4 mr-1" />
            Planes y Precios
          </Badge>
          <h1 className="text-5xl font-display font-bold text-gray-900 mb-4">
            Elige tu Plan DOJO
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Desde principiantes hasta maestros, tenemos el plan perfecto para tu formación
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`font-medium ${billingCycle === 'month' ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensual
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'month' ? 'year' : 'month')}
              className="relative w-16 h-8 bg-dojo-red rounded-full p-1 transition-colors"
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  billingCycle === 'year' ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`font-medium ${billingCycle === 'year' ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
              <Badge variant="success" size="sm" className="ml-2">
                Ahorra 20%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PLANS.map((plan) => {
            const isPopular = plan.id === 'family_plus'
            const price = billingCycle === 'year'
              ? Math.round(plan.price * 12 * 0.8)
              : plan.price

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${
                  isPopular ? 'shadow-lg scale-105 border-dojo-red' : ''
                } ${getPlanColor(plan.id)}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="bg-dojo-red text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Más Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {getPlanIcon(plan.id)}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        ${price}
                      </span>
                      <span className="text-gray-500">/mes</span>
                    </div>
                    {billingCycle === 'year' && (
                      <p className="text-sm text-gray-500 mt-1">
                        Facturado anualmente (${price * 12}/año)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Máximo de estudiantes: <span className="font-bold">{plan.maxStudents}</span>
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={selectedPlan !== null}
                    className={`w-full ${
                      isPopular
                        ? 'bg-dojo-red hover:bg-dojo-redDark text-white'
                        : ''
                    }`}
                    size="lg"
                  >
                    {selectedPlan === plan.id ? (
                      'Procesando...'
                    ) : (
                      <>
                        Comenzar ahora
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">
            ¿Tienes dudas? Contáctanos para planes personalizados
          </p>
          <Link href="/contact">
            <Button variant="outline">
              Contactar ventas
            </Button>
          </Link>
        </div>

        {/* FAQ Preview */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-8">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            {[
              {
                q: '¿Puedo cambiar de plan después?',
                a: 'Sí, puedes hacer upgrade o downgrade en cualquier momento desde tu panel de billing.',
              },
              {
                q: '¿Hay periodo de prueba gratis?',
                a: '¡Sí! Todos los planes incluyen 7 días gratis. Cancela antes que termine sin costo.',
              },
              {
                q: '¿Incluye IVA?',
                a: 'Los precios ya incluyen IVA. No hay cargos ocultos.',
              },
              {
                q: '¿Cómo funciona el pago?',
                a: 'Usamos Stripe para procesar pagos de forma segura. Aceptamos tarjetas de crédito/débito.',
              },
            ].map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
