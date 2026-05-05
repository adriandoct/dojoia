import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function validateRequest(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    throw new Error('Unauthorized')
  }
  return { user: session.user }
}
