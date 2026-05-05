'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Coins, ShoppingCart, Crown, Sparkles, Gift, Palette } from 'lucide-react'
import type { ShopItem } from '@/types'

export default function ShopPage() {
  const { data: session } = useSession()
  const [userCoins, setUserCoins] = useState(0)
  const [items, setItems] = useState<ShopItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShopData()
  }, [])

  async function fetchShopData() {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('dojicoins_balance')
        .eq('user_id', session?.user.id)
        .single()

      if (profile) {
        setUserCoins(profile.dojicoins_balance)
      }

      const { data: shopItems } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_active', true)
        .order('price_dojicoins', { ascending: true })

      if (shopItems) {
        setItems(shopItems)
      }
    } catch (error) {
      console.error('Error fetching shop data:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', label: 'Todos', icon: Gift },
    { id: 'avatar', label: 'Avatares', icon: Crown },
    { id: 'theme', label: 'Temas', icon: Palette },
    { id: 'powerup', label: 'Power-ups', icon: Sparkles },
    { id: 'real', label: 'Recompensas reales', icon: ShoppingCart },
  ]

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category)
    const Icon = cat?.icon || Gift
    return <Icon className="w-5 h-5" />
  }

  const handlePurchase = async (item: ShopItem) => {
    if (userCoins < item.price_dojicoins) {
      alert('No tienes suficientes DOJICOIN')
      return
    }

    const confirmed = confirm(`¿Comprar ${item.name} por ${item.price_dojicoins} DOJICOIN?`)
    if (!confirmed) return

    try {
      // Start transaction
      const { error: transactionError } = await supabase.rpc('purchase_item', {
        p_student_id: session?.user.id,
        p_item_id: item.id,
        p_price: item.price_dojicoins,
      })

      if (transactionError) throw transactionError

      alert(`¡${item.name} comprado con éxito! 🎉`)
      fetchShopData()
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Error al realizar la compra')
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Tienda DOJO
            </h1>
            <p className="text-gray-600 mt-1">
              Gasta tus DOJICOIN en recompensas exclusivas
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-6 py-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <Coins className="w-6 h-6 text-amber-600" />
              <div>
                <p className="text-xs text-gray-500">Tu saldo</p>
                <p className="text-xl font-bold text-amber-600">{userCoins.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category.id
                    ? 'bg-dojo-red text-white shadow-lg scale-105'
                    : 'bg-white border border-gray-200 hover:border-dojo-red'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{category.label}</span>
              </button>
            )
          })}
        </div>

        {/* Shop Grid */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No hay artículos disponibles en esta categoría.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const canAfford = userCoins >= item.price_dojicoins
              const isLimited = item.is_limited && (!item.stock_quantity || item.stock_quantity <= 5)

              return (
                <Card
                  key={item.id}
                  hover
                  className={`overflow-hidden group cursor-pointer ${
                    !canAfford ? 'opacity-60' : ''
                  }`}
                >
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center relative overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl">
                        {item.category === 'avatar' && '👤'}
                        {item.category === 'theme' && '🎨'}
                        {item.category === 'powerup' && '⚡'}
                        {item.category === 'real' && '🎁'}
                      </div>
                    )}

                    {isLimited && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="danger" size="sm">
                          ¡Últimas unidades!
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-600 font-bold text-xl">
                        <Coins className="w-5 h-5" />
                        {item.price_dojicoins.toLocaleString()}
                      </div>
                      {item.stock_quantity !== null && (
                        <Badge variant="outline" size="sm">
                          {item.stock_quantity} disponibles
                        </Badge>
                      )}
                    </div>

                    <Button
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford}
                      className="w-full"
                      variant={canAfford ? 'default' : 'secondary'}
                    >
                      {canAfford ? (
                        'Comprar'
                      ) : (
                        'Fondos insuficientes'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* How to earn coins */}
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Sparkles className="w-5 h-5" />
              ¿Cómo ganar más DOJICOIN?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">📚</span>
                  </div>
                  <span className="font-semibold">Completar lecciones</span>
                </div>
                <p className="text-sm text-gray-600">+10 a +100 DOJICOIN por lección</p>
              </div>

              <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🔥</span>
                  </div>
                  <span className="font-semibold">Mantener rachas</span>
                </div>
                <p className="text-sm text-gray-600">Bonificaciones por 7, 30, 100 días</p>
              </div>

              <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🏆</span>
                  </div>
                  <span className="font-semibold">Conseguir logros</span>
                </div>
                <p className="text-sm text-gray-600">+50 a +200 DOJICOIN por logro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

// Import needed
import { supabase } from '@/lib/supabase/client'
