import NextAuth, { type NextAuthOptions } from 'next-auth'
import { type Database } from '@/types/database'
import { supabaseServer } from '@/lib/supabase/client'

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
          // redirect_uri will be handled by NextAuth
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
      if (token) {
        session.user.id = token.sub
        session.user.role = (token as any).role
      }

      // Fetch full profile from Supabase
      try {
        const { data: profile } = await supabaseServer
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (profile) {
          session.user.profile = profile as any
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }

      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
}

export default NextAuth(authOptions)
