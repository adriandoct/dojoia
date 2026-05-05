import NextAuth, { type NextAuthOptions } from 'next-auth'
import { type Database } from '@/types/database'
import { createClient } from '@/lib/supabase/server'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      profile?: any
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'supabase',
      name: 'Supabase',
      type: 'oauth',
      clientId: process.env.NEXT_PUBLIC_SUPABASE_URL,
      clientSecret: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      authorization: {
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize`,
        params: {
          provider: 'google',
        },
      },
      token: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token`,
      userinfo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
      profile(profile) {
        return {
          id: profile.id,
          email: profile.email,
          name: profile.user_metadata?.full_name,
          image: profile.user_metadata?.avatar_url,
          role: profile.user_metadata?.role || 'student',
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = (profile as any)?.role || 'student'
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as any).id = token.sub as string
        ;(session.user as any).role = (token as any).role
      }

      if (token?.sub && session.user) {
        try {
          const supabase = await createClient()
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', token.sub)
            .single()

          if (profile) {
            ;(session.user as any).profile = profile
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      }

      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
