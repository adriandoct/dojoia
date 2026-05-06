'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Sparkles, Users, GraduationCap } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales inválidas')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen gradient-hero flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dojo-red/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-14 h-14 bg-dojo-red rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">D</span>
            </div>
            <span className="text-3xl font-display font-bold">DOJOIA</span>
          </div>

          <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
            Forma Campeones
            <br />
            <span className="text-dojo-red">para el Futuro</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-md">
            Plataforma educativa premium que combina karate, inglés, matemáticas,
            programación y más con inteligencia artificial.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-dojo-red/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span>IA personalizada para cada estudiante</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-dojo-red/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span>Panel completo para padres y maestros</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-dojo-red/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span>10 módulos educativos especializados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-dojo-red rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
            <span className="text-2xl font-display font-bold text-gray-900">DOJOIA</span>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Bienvenido de nuevo</CardTitle>
              <CardDescription>
                Inicia sesión para continuar tu formación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Social login */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039.147-.038.293-.077.44-.14.158.072.32.145.502.223.181.077.358.164.533.262.175.098.35.205.522.323.406.359.882.556 1.433.556.78 0 1.206-.47 1.38-.99.174-.52.578-2.003.578-2.003s-.09-.18-.18-.36c0-.42.152-1.05.486-1.54.333-.49 1.245-1.02 1.92-1.633.677-.612 1.18-1.537 1.18-2.597 0-1.062-.42-1.86-1.26-2.433-.84-.568-1.948-.608-2.926 0-1.126.446-1.26 1.37-1.26 2.433 0 1.06.503 1.985 1.18 2.597.405.44 1.005.74 1.687 1.163.68.42 1.296.787 1.666 1.057.37.27.735.46 1.102.567.367.107.74.17 1.135.17.57 0 1.116-.22 1.59-.658.473-.438.77-1.07.77-1.81 0-.75-.31-1.45-.92-2.1-.61-.655-1.44-1.02-2.33-1.02-.89 0-1.72.365-2.33 1.02s-.92 1.35-.92 2.1c0 .75.297 1.42.77 1.81.47.44 1.02.74 1.59.74.39 0 .77-.098 1.14-.268.37-.17.71-.39 1.02-.67.31-.28.567-.62.767-1.007.2-.385.31-.833.31-1.317 0-1.12-.44-2.056-1.32-2.8-.88-.745-2.06-1.164-3.34-1.164-1.28 0-2.47.418-3.36 1.18-.89.762-1.34 1.95-1.34 3.35 0 1.4.45 2.6 1.36 3.55.9.95 2.08 1.43 3.36 1.43 1.28 0 2.47-.42 3.36-1.18.89-.76 1.34-1.95 1.34-3.35 0-1.4-.45-2.6-1.36-3.55-.9-.95-2.08-1.43-3.36-1.43-1.28 0-2.47.42-3.36 1.18s-1.34 1.95-1.34 3.35c0 1.4.45 2.6 1.36 3.55.9.95 2.08 1.43 3.36 1.43 1.28 0 2.47-.42 3.36-1.18.89-.76 1.34-1.95 1.34-3.35 0-1.4-.45-2.6-1.36-3.55z" />
                  </svg>
                  Facebook
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    O continúa con
                  </span>
                </div>
              </div>

              {/* Login form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-gray-600">Recordarme</span>
                  </label>
                  <Link href="/forgot-password" className="text-dojo-red hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                >
                  Iniciar sesión
                </Button>
              </form>

              <div className="text-center text-sm">
                <span className="text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <Link href="/register" className="text-dojo-red font-medium hover:underline">
                    Regístrate gratis
                  </Link>
                </span>
              </div>

              <div className="text-center text-xs text-gray-500">
                <p>
                  ¿Eres una escuela?{' '}
                  <Link href="/register?type=school" className="text-dojo-red hover:underline">
                    Regístrate como institución
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
