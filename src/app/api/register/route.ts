import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuario ya existe' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: hashedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: validatedData.fullName,
        role: validatedData.role,
      },
    })

    if (authError) throw authError

    const userId = authData.user.id

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: userId,
      full_name: validatedData.fullName,
      birth_date: validatedData.birthDate || null,
      level_id: (await getInitialLevelId()) || null,
      dojicoins_balance: 100, // Welcome bonus
      total_points: 0,
      streak_days: 0,
      metadata: {},
    })

    if (profileError) throw profileError

    // Create family if parent
    if (validatedData.role === 'parent') {
      await createFamily(userId)
    }

    // Send welcome email (optional)
    await sendWelcomeEmail(validatedData.email, validatedData.fullName)

    return NextResponse.json({
      success: true,
      message: 'Usuario creado correctamente',
    })
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function getInitialLevelId(): Promise<string | null> {
  const { data } = await supabase
    .from('levels')
    .select('id')
    .eq('code', 'white')
    .limit(1)
    .single()

  return data?.id || null
}

async function createFamily(parentId: string): Promise<string> {
  const { data, error } = await supabase
    .from('families')
    .insert({
      parent_id: parentId,
      family_name: 'Mi Familia',
      metadata: {},
    })
    .select()
    .single()

  if (error) throw error

  return data.id
}

async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  console.log(`Welcome email sent to ${email}`)
}
