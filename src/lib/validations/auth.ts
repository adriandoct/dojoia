import { z } from 'zod'


export const registerSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
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

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const lessonCompleteSchema = z.object({
  lesson_id: z.string().uuid('ID de lección inválido'),
  score: z.number().min(0).max(100),
  time_spent_sec: z.number().min(0),
})

export const exerciseAnswerSchema = z.object({
  exercise_id: z.string().uuid('ID de ejercicio inválido'),
  answer: z.string(),
})

export const aiMessageSchema = z.object({
  message: z.string().min(1, 'El mensaje no puede estar vacío'),
  module_code: z.string().optional(),
})
