import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { itemId, quantity = 1 } = await request.json()

    // Get session info - this would need proper auth in production
    const studentId = 'current-user-id' // Get from auth session

    // Verify item exists and is available
    const { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .eq('is_active', true)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      )
    }

    if (item.stock_quantity !== null && item.stock_quantity < quantity) {
      return NextResponse.json(
        { error: 'Stock insuficiente' },
        { status: 400 }
      )
    }

    const totalPrice = item.price_dojicoins * quantity

    // Check if student has enough coins
    const { data: profile } = await supabase
      .from('profiles')
      .select('dojicoins_balance')
      .eq('id', studentId)
      .single()

    if (!profile || profile.dojicoins_balance < totalPrice) {
      return NextResponse.json(
        { error: 'Fondos insuficientes' },
        { status: 400 }
      )
    }

    // Start transaction
    const { error: updateError } = await supabase.rpc('transaction', {
      p_student_id: studentId,
      p_item_id: itemId,
      p_quantity: quantity,
      p_total_price: totalPrice,
    })

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Compra realizada exitosamente',
      new_balance: profile.dojicoins_balance - totalPrice,
    })
  } catch (error: any) {
    console.error('Purchase error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    )
  }
}
