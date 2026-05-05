# DOJOIA - Guía de Configuración y Desarrollo

## 📋 Índice
1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Configuración Inicial](#configuración-inicial)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Base de Datos](#base-de-datos)
6. [Funcionalidades Principales](#funcionalidades-principales)
7. [Despliegue](#despliegue)
8. [Mantenimiento](#mantenimiento)

---

## Visión General

DOJOIA es una plataforma educativa premium para niños y jóvenes de 5 a 17 años que combina:
- Karate y valores
- Inglés conversacional
- Matemáticas inteligentes
- Lectura comprensiva
- Escritura creativa
- Programación
- Robótica
- Liderazgo
- Hábitos de éxito
- IA personalizada

**Modelo inspirado en Kumon pero evolucionado con tecnología, IA y gamificación.**

---

## Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos utilitarios
- **Framer Motion** - Animaciones
- **Shadcn/ui** - Componentes UI

### Backend & Database
- **Supabase** - PostgreSQL + Auth + Storage + Real-time
- **NextAuth.js** - Autenticación (con Supabase adapter)

### IA
- **OpenAI API** (GPT-4 + Whisper) - AI Coach, generación de ejercicios, análisis

### Pagos
- **Stripe** - Pagos internacionales
- **MercadoPago** - Pagos LATAM

### DevOps
- **Vercel** - Hosting y despliegue
- **GitHub** - Version control

---

## Configuración Inicial

### 1. Prerrequisitos
```bash
Node.js 18+
npm o yarn
Git
Cuenta Supabase
Cuenta OpenAI
Cuenta Stripe (opcional)
```

### 2. Clonar y instalar
```bash
git clone <repo-url>
cd dojoia
npm install
```

### 3. Configurar variables de entorno
Copia `.env.local.example` a `.env.local`:

```bash
cp .env.local.example .env.local
```

Edita las siguientes variables:

#### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

#### Auth
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
```

#### OpenAI
```env
OPENAI_API_KEY=sk-tu_api_key
```

#### Stripe (opcional)
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### App
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DOJOIA
```

### 4. Base de datos Supabase

#### 4.1 Ejecutar migraciones
```bash
npm run db:push
```

Las migraciones están en `supabase/migrations/` y crearán todas las tablas necesarias.

#### 4.2 Seed data (datos iniciales)
```bash
npx tsx supabase/seed.ts
```

Esto insertará:
- Niveles (White → Black)
- Módulos (Math, English, Code, Robotics, Karate, Read, Write)
- Lecciones de ejemplo
- Logros/achievements
- Items de la tienda

### 5. Correr localmente
```bash
npm run dev
```

Visita http://localhost:3000

---

## Estructura del Proyecto

```
dojoia/
├── src/
│   ├── app/                    # App Router Pages
│   │   ├── (auth)/            # Login, Register, Forgot Password
│   │   ├── (dashboard)/       # Dashboard pages (protected)
│   │   │   ├── student/       # Student dashboard & modules
│   │   │   │   ├── math/      # DOJO MATH module
│   │   │   │   ├── ai-coach/  # AI Coach chat
│   │   │   │   └── shop/      # DOJICOIN shop
│   │   │   ├── parent/        # Parent dashboard
│   │   │   └── teacher/       # Teacher dashboard
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth route handlers
│   │   │   ├── register/      # User registration
│   │   │   └── ...
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── ui/                # Base UI (Button, Card, Input, etc.)
│   │   ├── layout/            # DashboardLayout, Navbar, etc.
│   │   ├── auth/              # ProtectedRoute, etc.
│   │   └── modules/           # Module-specific components
│   ├── lib/                   # Utilities & configurations
│   │   ├── supabase/          # Supabase client setup
│   │   ├── services/          # OpenAI, Stripe services
│   │   └── utils/             # Helper functions
│   ├── types/                 # TypeScript definitions
│   │   ├── index.ts           # Main types
│   │   └── database.ts        # Supabase DB types
│   └── styles/
│       └── globals.css        # Global styles + Tailwind
├── supabase/
│   ├── seed.ts                # Database seeding script
│   ├── functions/             # Supabase Edge Functions
│   └── storage/               # Storage policies
├── public/                    # Static assets
├── .env.local.example         # Environment variables template
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.mjs            # Next.js configuration
└── package.json               # Dependencies
```

---

## Base de Datos

### Tablas Principales

#### Usuarios y Perfiles
- `users` - Autenticación (email, role)
- `profiles` - Información extendida del usuario
- `levels` - Niveles de progresión (White → Black)
- `modules` - Módulos educativos
- `lessons` - Lecciones individuales
- `exercises` - Ejercicios por lección

#### Progreso
- `student_progress` - Progreso por estudiante-por-lección
- `exercise_attempts` - Intentos de ejercicios
- `daily_missions` - Misiones diarias

#### Gamificación
- `achievements` - Logros/insignias
- `student_achievements` - Logros desbloqueados
- `dojicoins_transactions` - Historial de moneda
- `rankings` - Rankings por período

#### Contenido
- `articles`, `videos`, `books`

#### Negocio
- `subscriptions` - Planes de pago
- `payments` - Historial de pagos
- `shop_items` - Tienda
- `purchases` - Compras

#### Social
- `families` - Familias
- `schools` - Instituciones
- `notifications` - Notificaciones

#### IA
- `ai_conversations` - Conversaciones con AI Coach
- `ai_messages` - Mensajes individuales

---

## Funcionalidades Principales

### 1. Sistema de Niveles (Cintas)

| Nivel | Código | XP Mín | XP Máx | Color |
|-------|--------|--------|--------|-------|
| Cinta Blanca | white | 0 | 1,000 | Blanco |
| Cinta Amarilla | yellow | 1,000 | 2,500 | Amarillo |
| Cinta Naranja | orange | 2,500 | 5,000 | Naranja |
| Cinta Verde | green | 5,000 | 10,000 | Verde |
| Cinta Azul | blue | 10,000 | 20,000 | Azul |
| Cinta Café | brown | 20,000 | 40,000 | Café |
| Cinta Negra | black | 40,000 | 100,000 | Negro |

El sistema calcula automáticamente el nivel basado en `total_points` en `profiles`.

### 2. DOJO MATH - Ejercicios Interactivos

**Tipos de ejercicio:**
- Múltiple choice
- Completar espacios
- Coding (ejecución de código)
- Speaking (pronunciación)
- Drag & drop
- Video (ver y responder)

**Progresión:**
1. Estudiante selecciona lección
2. Responde ejercicios uno por uno
3. Feedback inmediato con explicación
4. XP otorgado basado en puntuación y tiempo
5. Registro de intentos
6. Desbloqueo de siguiente lección al completar

### 3. AI Coach

**Capacidades:**
- Chat 24/7 tipo ChatGPT
- Contexto del estudiante (nivel, progreso, debilidades)
- Generación de ejercicios personalizados
- Análisis de fortalezas
- Consejos de estudio
- Motivación estilo "sensei"

**Implementación:**
```typescript
import { generateAIResponse } from '@/lib/services/openai'

const response = await generateAIResponse({
  studentProfile: { name, level, interests, weaknesses },
  currentLesson: { title, description, module },
  recentProgress: { lessonsCompleted, averageScore, streakDays },
  conversationHistory: [...],
}, userMessage)
```

### 4. Gamificación

#### DOJICOIN (moneda interna)
- Se gana completando lecciones (+10 a +100)
- Misiones diarias (+50 a +200)
- Logros (+50 a +500)
- Manteniendo rachas (bonus)
- Se gasta en la tienda

#### Sistema de Logros
Ejemplos:
- `first_lesson` - Completa primera lección
- `streak_7` - 7 días consecutivos
- `xp_1000` - 1000 XP totales
- `level_up` - Subir de nivel
- `perfect_score` - 100% en lección

#### Rankings
- Diario, semanal, mensual, todo tiempo
- Por módulo específico
- Competitivo pero saludable (solo nombres, no datos reales)

### 5. Dashboard para Padres

**Características:**
- Vista de todos los hijos
- Progreso individual por hijo
- Reportes semanales en PDF
- Recomendaciones IA personalizadas
- Alertas de inactividad
- Posibilidad de asignar metas

**API Endpoints:**
```
GET /api/parent/children
GET /api/parent/progress/:childId
GET /api/parent/reports/weekly
```

### 6. Dashboard para Maestros

**Características:**
- Lista de estudiantes asignados
- Rendimiento por estudiante
- Creación de clases en vivo
- Asignación de tareas
- Rankings grupales
- Alertas a estudiantes con bajo rendimiento

---

## API Reference

### Autenticación

#### POST `/api/auth/[...nextauth]`
NextAuth con Supabase adapter. Roles: `student`, `parent`, `teacher`, `admin`.

#### POST `/api/register`
Registro de nuevo usuario.
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "student|parent|teacher|school_admin",
  "birthDate": "string" // optional
}
```

### Estudiantes

#### GET `/api/student/lessons`
Lista de lecciones disponibles.

#### GET `/api/student/lessons/:id/exercises`
Obtiene ejercicios de una lección.

#### POST `/api/student/lessons/:id/complete`
Marca lección como completada.
```json
{
  "score": 95,
  "time_spent_sec": 320
}
```

#### POST `/api/student/exercises/:id/answer`
Registra respuesta a ejercicio.
```json
{
  "answer": "opción seleccionada"
}
```

### AI Coach

#### GET `/api/ai/conversation`
Obtiene sesión actual o crea nueva.

#### POST `/api/ai/message`
Envía mensaje y recibe respuesta.
```json
{
  "message": "¿Cómo sumar fracciones?",
  "module_code": "math" // optional
}
```

### DOJICOIN

#### GET `/api/shop/items`
Lista items de la tienda.

#### POST `/api/shop/purchase`
Compra un item.
```json
{
  "itemId": "uuid",
  "quantity": 1
}
```

### Padres

#### GET `/api/parent/children`
Lista hijos con progreso.

#### GET `/api/parent/reports/weekly/:childId`
Reporte semanal en PDF.

---

## Implementación de Módulos

### DOJO MATH - Ejemplo Completo

```typescript
// 1. Database Schema
// lessons table
{
  id: uuid
  module_id: fk → modules
  level_id: fk → levels
  title: string
  description: string
  content: jsonb // video_url, resources, hints
  order_index: int
  est_duration_min: int
  xp_reward: int
  is_locked: boolean
  unlock_criteria: jsonb // { lesson_id, min_score }
}

// exercises table
{
  id: uuid
  lesson_id: fk
  type: enum
  question: string
  options: string[]
  correct_answer: string
  explanation: string
  points_value: int
  difficulty: enum
  metadata: jsonb
}

// 2. API Route
// app/api/lessons/[id]/exercises/route.ts
export async function GET(request: Request) {
  const { id } = params
  // Fetch exercises
}

// 3. Page Component
// app/dashboard/student/math/page.tsx
export default function MathPage() {
  // Fetch lessons with progress
  // Render interactive exercise UI
  // Call completion API
}

// 4. Submission Logic
export async function submitAnswer(
  studentId: string,
  exerciseId: string,
  answer: string
) {
  // 1. Check correctness
  // 2. Calculate XP (score * multiplier)
  // 3. Update student_progress
  // 4. Award DOJICOIN
  // 5. Check achievements
  // 6. Update rankings
  // 7. Send notification
}
```

---

## Despliegue

### 1. Preparar para producción

```bash
# Build
npm run build

# Lint
npm run lint

# Type check
npm run typecheck
```

### 2. Configurar Supabase para producción

1. **Connect custom domain** en Supabase dashboard
2. **Enable Row Level Security (RLS)** en todas las tablas
3. **Create service role policies**
4. **Set up Storage buckets**
5. **Configure CORS** (allowed origins)

### 3. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

O conectar GitHub repo y configurar auto-deploy.

### 4. Environment variables en Vercel

En dashboard de Vercel, agregar:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
NEXTAUTH_SECRET
NEXTAUTH_URL
```

### 5. Configurar Webhooks

#### Stripe webhook (opcional)
Endpoint: `/api/webhooks/stripe`
Para manejar pagos y suscripciones.

#### OpenAI usage tracking (opcional)
Registrar tokens usados por conversación.

---

## Mantenimiento

### Monitoreo

**Supabase Dashboard:**
- Database queries performance
- Auth events
- Storage usage

**Vercel Analytics:**
- Page performance
- Error tracking

**OpenAI Usage:**
- Tokens consumed per month
- Cost tracking

### Backups

**Supabase automatic backups:**
- Daily backups (keep 7 days)
- Point-in-time recovery

**Export data (opcional):**
```sql
-- Export student data
COPY (SELECT * FROM profiles) TO '/tmp/profiles.csv';
```

### Updates

**Actualizar dependencias:**
```bash
npm outdated
npm update
```

**Verificar breaking changes:**
- Next.js release notes
- Supabase changelog
- OpenAI API updates

---

## Troubleshooting

### Error: "Invalid API key"
- Verificar `OPENAI_API_KEY` esté correcta
- Verificar saldo en OpenAI

### Error: "Row Level Security"
- Revisar políticas RLS en Supabase
- Asegurar service role key correcta

### Error: "Cannot read property of undefined"
- Verificar tipos en `src/types/database.ts`
- Re-generar tipos con `supabase gen types`

### Lento rendimiento
- Agregar índices en tablas grandes
- Usar `select()` específicos, no `*`
- Implementar paginación

---

## Roadmap Futuro

### Fase 2 (Próximo release)
- [ ] App móvil nativa (React Native / Expo)
- [ ] Más módulos (Science, Arts, Music)
- [ ] Sistema de clanes/tormentas
- [ ] PvP battles (quiz duels)
- [ ] Realidad aumentada (AR)

### Fase 3
- [ ] Marketplace de profesores particulares
- [ ] Streaming en vivo para clases
- [ ] Análisis avanzado con ML
- [ ] Integración con wearables
- [ ] Modo offline completo

### Fase 4 - Escala
- [ ] Multi-idioma (inglés, español, portugués, francés)
- [ ] Expansión internacional
- [ ] Franquicias locales ("Dojos físicos")
- [ ] Partnerships con escuelas

---

## Contacto y Soporte

**GitHub Issues:** Reportar bugs o solicitar features
**Email:** hola@dojoia.com
**Discord:** [Enlace invitación]

---

**¡Gracias por usar DOJOIA! 🥋✨**
