'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User, Users, Building2, UserPlus, Sparkles, ChevronLeft } from 'lucide-react'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'parent', 'teacher', 'school_admin']),
  birthDate: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

const userTypes = [
  {
    id: 'student',
    title: 'Estudiante',
    description: 'Para niños y jóvenes que quieren aprender',
    icon: User,
    color: 'bg-blue-500',
    features: ['Acceso a todos los módulos', 'AI Coach personal', 'Gamificación completa'],
  },
  {
    id: 'parent',
    title: 'Padre / Madre',
    description: 'Para gestionar el aprendizaje de tus hijos',
    icon: Users,
    color: 'bg-green-500',
    features: ['Panel de progreso', 'Reportes semanales', 'Hasta 3 hijos'],
  },
  {
    id: 'school_admin',
    title: 'Escuela',
    description: 'Para instituciones educativas',
    icon: Building2,
    color: 'bg-purple-500',
    features: ['Gestión de estudiantes', 'Panel escolar', 'Múltiples licencias'],
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedRole = searchParams.get('type') as any

  const [step, setStep] = useState<'role' | 'form'>(preselectedRole ? 'form' : 'role')
  const [selectedRole, setSelectedRole] = useState<RegisterForm['role'] | null>(
    preselectedRole === 'school' ? 'school_admin' : preselectedRole as any || null
  )
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: preselectedRole === 'school' ? 'school_admin' : (preselectedRole as any) || 'student',
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error al registrar')
      }

      // Redirect to onboarding or dashboard based on role
      router.push(`/onboarding?role=${data.role}`)
    } catch (error) {
      console.error('Registration error:', error)
      alert('Error al registrar. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedUserType = userTypes.find(t => t.id === selectedRole)

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
            Únete a la
            <br />
            <span className="text-dojo-red">Revolución Educativa</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-md">
            Miles de familias ya confían en DOJOIA para formar campeones del futuro
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-3xl font-bold text-dojo-red">25K+</p>
              <p className="text-sm text-gray-300">Estudiantes activos</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-3xl font-bold text-yellow-400">1M+</p>
              <p className="text-sm text-gray-300">Lecciones completadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration */}
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
            <CardHeader>
              {/* Back button */}
              {step === 'form' && selectedRole && (
                <button
                  onClick={() => setStep('role')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Volver
                </button>
              )}

              <CardTitle className="text-2xl font-display text-center">
                {step === 'role' ? '¿Quién eres?' : 'Crea tu cuenta'}
              </CardTitle>
              <CardDescription className="text-center">
                {step === 'role'
                  ? 'Selecciona tu tipo de usuario para continuar'
                  : selectedUserType
                  ? `Regístrate como ${selectedUserType.title.toLowerCase()}`
                  : ''}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Step 1: Role Selection */}
              {step === 'role' && (
                <div className="grid gap-4">
                  {userTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          setSelectedRole(type.id as any)
                          setStep('form')
                        }}
                        className="p-4 border-2 border-gray-200 rounded-xl text-left hover:border-dojo-red hover:bg-red-50 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-dojo-red">
                              {type.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {type.description}
                            </p>
                            <ul className="mt-2 space-y-1">
                              {type.features.map((feature, i) => (
                                <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-dojo-red" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Step 2: Registration Form */}
              {step === 'form' && selectedRole && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Nombre completo"
                    placeholder="Juan Pérez"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />

                  {selectedRole === 'student' && (
                    <Input
                      label="Fecha de nacimiento"
                      type="date"
                      error={errors.birthDate?.message}
                      {...register('birthDate')}
                    />
                  )}

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
                    placeholder="Mínimo 8 caracteres"
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    placeholder="Repite tu contraseña"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      className="mt-1 rounded border-gray-300"
                      {...register('acceptTerms')}
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                      Acepto los{' '}
                      <Link href="/terms" className="text-dojo-red hover:underline">
                        términos y condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link href="/privacy" className="text-dojo-red hover:underline">
                        política de privacidad
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
                  )}

                  <input type="hidden" {...register('role')} value={selectedRole} />

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Crear cuenta
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-dojo-red font-medium hover:underline">
                      Inicia sesión
                    </Link>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Al registrarte obtienes:
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white">
                🎁 7 días gratis
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white">
                🤖 AI Coach incluido
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white">
                🏆 Certificado de bienvenida
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
