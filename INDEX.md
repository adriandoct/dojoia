# DOJOIA - Documentación Completa

## 🎯 Descripción General

**DOJOIA** es una plataforma educativa web y móvil inspirada en el exitoso modelo Kumon, pero evolucionada hacia el futuro con:

- 📚 **10 módulos educativos** especializados
- 🤖 **AI Coach** personal 24/7
- 🎮 **Gamificación completa** con DOJICOIN y cintas
- 👨‍👩‍👧‍👦 **Roles diferenciados**: Estudiante, Padre, Maestro, Admin
- 📊 **Dashboard analítico** para cada rol
- 🔐 **Autenticación segura** con Supabase Auth
- 💾 **Base de datos** relacional en PostgreSQL

---

## 📁 Estructura de Archivos Creada

```
DOJOIA/
├── 📄 README.md                     # Descripción inicial del proyecto
├── 📄 package.json                 # Dependencias (Next.js, Supabase, OpenAI, etc.)
├── 📄 tsconfig.json                # Configuración TypeScript
├── 📄 tailwind.config.ts           # Configuración Tailwind + DOJO theme
├── 📄 postcss.config.js            # Configuración PostCSS
├── 📄 .env.local.example           # Variables de entorno
│
├── 📂 src/
│   ├── types/
│   │   ├── index.ts                # Tipos TypeScript principales
│   │   └── database.ts             # Tipos generados de Supabase
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   └── client.ts           # Clientes Supabase (server + client)
│   │   ├── utils/
│   │   │   └── helpers.ts          # Utilidades (formatDate, cn, etc.)
│   │   ├── services/
│   │   │   └── openai.ts           # Servicios OpenAI (AI Coach)
│   │   └── validations/
│   │       └── auth.ts             # Schemas Zod para validación
│   │
│   ├── components/
│   │   ├── ui/                     # Componentes UI base
│   │   │   ├── button.tsx          # Botón con variantes CVA
│   │   │   ├── card.tsx            # Card con hover, gradient
│   │   │   ├── input.tsx           # Input con validación visual
│   │   │   ├── select.tsx          # Select personalizado
│   │   │   ├── tabs.tsx            # Tabs component
│   │   │   ├── avatar.tsx          # Avatar con colores de nivel
│   │   │   ├── badge.tsx           # Badges con colores level
│   │   │   ├── progress.tsx        # ProgressRing + BeltProgress
│   │   │   ├── modal.tsx           # Modal reutilizable
│   │   │   ├── toast.tsx           # Notificaciones toast
│   │   │   └── spinner.tsx         # Loading spinners
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx # Layout con sidebar responsive
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx  # HOC para rutas protegidas
│   │   └── providers/
│   │       └── AuthProvider.tsx    # Session provider
│   │
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Layout root (fonts, metadata)
│   │   ├── page.tsx                # 🏠 Landing page hero
│   │   ├── globals.css             # Estilos globales + DOJO theme
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx      # 🔐 Login page
│   │   │   └── register/page.tsx   # 📝 Register con selector de rol
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── student/
│   │   │   │   ├── page.tsx        # 🎓 Dashboard student principal
│   │   │   │   ├── math/page.tsx   # ➕ DOJO MATH module
│   │   │   │   ├── ai-coach/page.tsx # 🤖 AI Coach chat
│   │   │   │   └── shop/page.tsx   # 🛒 Tienda DOJICOIN
│   │   │   ├── parent/page.tsx    # 👨‍👩‍👧‍👦 Parent dashboard
│   │   │   └── teacher/page.tsx   # 👨‍🏫 Teacher dashboard
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/route.ts # NextAuth config
│   │       ├── register/route.ts  # Registro usuarios
│   │       ├── student/progress/route.ts   # API progreso estudiante
│   │       └── purchases/route.ts # Compras DOJICOIN
│   │
│   └── public/                     # Assets estáticos
│
├── 📂 supabase/
│   ├── seed.ts                    # Datos iniciales (levels, modules, lessons)
│   └── migrations/                # Migraciones SQL (create tables)
│
└── 📚 Documentation/
    ├── SETUP_GUIDE.md             # Guía completa de configuración
    ├── DATABASE_SCHEMA.md         # Esquema de base de datos
    ├── PROJECT_SUMMARY.md         # Esta documentación
    └── API_REFERENCE.md           # (se creará después)
```

---

## 🎨 Design System

### Colores Principal

```css
.dojo-red { background: #E53E3E; }     /* Acciones, energía */
.dojo-redDark { background: #C53030; } /* Hover */
.dojo-black { background: #000000; }   /* Elegancia */
.dojo-white { background: #FFFFFF; }   /* Limpieza */
.dojo-blue { background: #3182CE; }    /* Tecnología */
```

### Colores por Nivel (Cintas)

| Nivel | Código | Color |
|-------|--------|-------|
| White | `white` | `#FFFFFF` |
| Yellow | `yellow` | `#F6E05E` |
| Orange | `orange` | `#ED8936` |
| Green | `green` | `#48BB78` |
| Blue | `blue` | `#4299E1` |
| Brown | `brown` | `#975A16` |
| Black | `black` | `#1A202C` |

### Tipografía

- **Display** (headings): Poppins (400-800)
- **Body** (texto): Inter (300-700)

### Componentes Reutilizables

```tsx
// Botones con múltiples variantes
<Button variant="default|secondary|outline|ghost" size="sm|md|lg|xl" />

// Cards con hover y gradient
<Card hover gradient className="...">

// Avatares con color de nivel
<Avatar fallback="JS" levelColor="#4299E1" size="lg" />

// ProgressRing de nivel
<ProgressRing progress={75} levelCode="green" size={120} />
```

---

## 🗄️ Base de Datos - Tablas Clave

### Core Entities

```sql
-- Usuarios (Auth)
users (id, email, role, created_at)

-- Perfiles (datos extendidos)
profiles (
  id, user_id, full_name, birth_date,
  level_id, dojicoins_balance, total_points,
  streak_days, metadata
)

-- Niveles (cintas)
levels (id, code, name, min_points, max_points, color_hex)

-- Módulos
modules (id, code, name, description, color_hex)

-- Lecciones
lessons (
  id, module_id, level_id, title,
  xp_reward, is_locked, unlock_criteria
)

-- Ejercicios
exercises (
  id, lesson_id, type, question,
  options, correct_answer, points_value
)
```

### Progreso

```sql
student_progress (student_id, lesson_id, status, score, completed_at)
exercise_attempts (student_id, exercise_id, answer, is_correct)
daily_missions (student_id, date, missions_completed)
```

### Gamificación

```sql
achievements (code, name, points_reward, dojicoins_reward, criteria)
student_achievements (student_id, achievement_id, unlocked_at)
dojicoins_transactions (student_id, amount, type, source, balance_after)
rankings (period, student_id, points, position)
```

### Negocio

```sql
subscriptions (user_id, plan, status, stripe_id)
payments (user_id, amount, status, payment_method)
shop_items (name, category, price_dojicoins, stock)
purchases (student_id, item_id, quantity, total_price)
```

---

## 🔄 Flujos de Usuario

### 1. Registro → Onboarding → Dashboard

```
Landing Page (home.tsx)
    ↓
Register (register/page.tsx)
    ↓ Select role (student/parent/teacher)
    ↓
Complete profile (birthdate, interests)
    ↓ Onboarding tutorial
    ↓ Dashboard (role-specific)
    ↓ First lesson → Earn XP → Level up
```

### 2. Student Journey

```
Login → Student Dashboard
    ↓ See: XP, DOJICOIN, Streak, Completed lessons
    ↓ Click lesson → Exercises page
    ↓ Read question → Select answer → Submit
    ↓ Immediate feedback (✅/❌ + explanation)
    ↓ Continue or finish lesson
    ↓ XP awarded (based on score, time, streak)
    ↓ Level progress updated
    ↓ Notification (achievement, level up)
    ↓ Visit shop or continue learning
```

### 3. AI Coach Flow

```
Student Dashboard → AI Coach tab
    ↓ Open chat interface
    ↓ AI greets + context loaded (name, level, recent progress)
    ↓ Student types question
    ↓ Message sent to OpenAI GPT-4
    ↓ Response arrives with emojis and sensei tone
    ↓ Conversation saved to Supabase
    ↓ Student can refer to previous messages
```

### 4. Parent Monitoring

```
Login → Parent Dashboard
    ↓ See children cards (name, level, XP, avg score)
    ↓ Click child → Detailed progress
    ↓ View recent activity feed
    ↓ Read AI recommendations
    ↓ (Future) send message to teacher
    ↓ (Future) adjust child's settings
```

---

## 🎮 Gamification Mechanics

### Cintas (Levels) Progresivas

```
White (0-1,000 XP)
    → Yellow (1,000-2,500 XP)
    → Orange (2,500-5,000 XP)
    → Green (5,000-10,000 XP)
    → Blue (10,000-20,000 XP)
    → Brown (20,000-40,000 XP)
    → Black (40,000-100,000 XP) MASTER
```

### DOJICOIN Economy

**Earn:**
- Complete lesson: `+10 to +100`
- Daily mission: `+20 to +50`
- Achievements: `+50 to +500`
- 7-day streak bonus: `+100`
- 30-day streak bonus: `+500`

**Spend:**
- Avatars: `500 - 2,000 DOJICOIN`
- Themes: `1,500 DOJICOIN`
- Power-ups: `100 - 500 DOJICOIN`
- Real rewards (TBD)

### Daily Missions

```json
{
  "missions_completed": 3,
  "total_missions": 5,
  "rewards": {
    "complete_all": "+100 DOJICOIN",
    "complete_3": "+50 DOJICOIN"
  }
}
```

### Achievements Logic

```sql
-- Examples of achievement criteria (JSON)
{
  "type": "lessons_completed", "count": 10
  "type": "streak", "days": 7
  "type": "total_xp", "amount": 1000
  "type": "module_perfect", "module": "math", "lessons": 5
}
```

---

## 🤖 AI Coach Implementation

### Context Structure

```typescript
{
  studentProfile: {
    name: "Sofía",
    level: "Cinta Amarilla",
    interests: ["math", "karate"],
    weaknesses: ["speaking"]
  },
  currentLesson: {
    title: "Sumas hasta 20",
    module: "math",
    description: "..."
  },
  recentProgress: {
    lessonsCompleted: 45,
    averageScore: 92,
    streakDays: 7
  },
  conversationHistory: [10 últims mensajes]
}
```

### Tone del Sensei

```
- 👋 Saluda cálidamente
- 🎯 Da pasos pequeños ("rompe la barrera del miedo")
- 🔁 Repite con ejemplos creativos ("como en el dojo repetimos katas")
- 🌟 Refuerza positivamente ("¡buen golpe!")
- 📈 Aumenta dificultad gradualmente
- 🥋 Vincula a valores (disciplina, respeto, constancia)
- ❓ Termina con pregunta ("¿Quieres practicar más?")
```

---

## 💰 Payment & Subscriptions (Next Steps)

### Planes

| Plan | Precio (MXN) | Estudiantes | Características |
|------|-------------|-------------|-----------------|
| Básico | $199/mes | 1 | All modules, AI Coach |
| Plus | $349/mes | 3 | + Parent panel, reports |
| Escolar | Contacto | Ilimitados | School admin, classes |
| Premium Sensei | $599/mes | 1 | + Live mentoring |

### Stripe Flow

```
User clicks "Upgrade"
    → Create Stripe Checkout Session
    → Redirect to Stripe
    → Payment success
    → Webhook → Update subscription in DB
    → Unlock premium features
    → Send confirmation email
```

---

## 📱 Mobile App (Future)

### React Native Structure

```
dojoia-mobile/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── module/ (Math, English, ...)
├── components/
├── services/
├── navigation/
└── assets/
```

Features:
- Offline lessons download
- Speech recognition (English speaking)
- AR karate moves (camera)
- Push notifications
- Sync with cloud

---

## 🚀 Deployment Checklist

### 1. Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://dojoia.com
```

### 2. Supabase

- [ ] Run migrations: `supabase db push`
- [ ] Seed data: `npx tsx supabase/seed.ts`
- [ ] Enable RLS on all tables
- [ ] Create service role policies
- [ ] Set up Storage buckets (avatars, videos)
- [ ] Configure auth providers (Google, Facebook)
- [ ] Set up custom domain (optional)

### 3. Vercel

- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set build command: `npm run build`
- [ ] Enable production branch deployments
- [ ] Add custom domain

### 4. OpenAI

- [ ] Add payment method
- [ ] Set usage limits (to avoid surprise bills)
- [ ] Monitor daily usage

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server @ localhost:3000
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript check

# Database
npm run db:push          # Apply migrations
npm run db:studio        # Open Supabase Studio

# Testing (when implemented)
npm test                 # Unit tests
npm run test:e2e         # E2E tests
```

---

## 📈 Metrics & Analytics

### Key Metrics to Track

**User Metrics:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Retention (D1, D7, D30)
- Avg sessions per user
- Session duration

**Learning Metrics:**
- Lessons completed per day
- Average score per module
- XP distribution
- Streak distribution
- Achievement unlock rate

**Business Metrics:**
- Conversion rate (free → paid)
- Customer Lifetime Value (CLV)
- Churn rate
- ARPU (Average Revenue Per User)
- Cost per acquisition (CPA)

---

## 🛡️ Security Best Practices

### Implemented
- RLS on all tables
- Password hashing (bcrypt)
- Session management with JWT
- Input validation (Zod)
- Rate limiting (NextAuth)

### Additional Recommendations
- Enable 2FA for admin accounts
- Audit logs table
- IP whitelist for admin panel
- CSP headers
- HSTS
- Regular security audits

---

## 🐛 Troubleshooting

### "Error: Invalid API key provided"
✅ Check `OPENAI_API_KEY` environment variable
✅ Verify OpenAI account has credits

### "Row Level Security violation"
✅ Ensure RLS policies are correct
✅ Use service role key for server-side operations
✅ Check user_id matches session

### "Cannot read property 'x' of undefined"
✅ Regenerate Supabase types: `supabase gen types typescript > src/types/database.ts`
✅ Check that API returns expected shape

### "Request failed with status code 429"
✅ OpenAI rate limit exceeded
✅ Implement exponential backoff retry
✅ Consider caching frequent responses

---

## 📞 Support & Resources

### Official Docs
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API](https://platform.openai.com/docs)

### Community
- GitHub Issues: Report bugs/suggest features
- Discord: `DOJOIA Community` (invite pending)

---

## ✅ Status Actual (May 2026)

### Completado
- [x] Landing page
- [x] Auth system (login/register)
- [x] Student dashboard
- [x] DOJO MATH module (complete with exercises)
- [x] DOJO AI Coach (OpenAI integration)
- [x] Parent dashboard
- [x] Teacher dashboard
- [x] Shop with DOJICOIN
- [x] Gamification system
- [x] Database schema
- [x] UI components library
- [x] Documentation (SETUP + PROJECT_SUMMARY)

### Pendiente (Prioridad Media/Alta)
- [ ] DOJO ENGLISH (speech recognition)
- [ ] DOJO CODE module
- [ ] DOJO ROBOTICS module
- [ ] Stripe payments integration
- [ ] Real-time notifications (Supabase subscriptions)
- [ ] Offline mode (service workers)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics

### Pendiente (Optimizaciones)
- [ ] Implement comprehensive error boundaries
- [ ] Add loading skeletons for all pages
- [ ] Optimize images (next/image)
- [ ] Add sitemap.xml + robots.txt
- [ ] Set up monitoring (Sentry)
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Accessibility audit (WCAG)

---

## 🎓 Dojo Values

> **Disciplina + Conocimiento + Futuro**

Cada línea de código en este proyecto refleja:
- **Disciplina**: Código limpio, bien estructurado, documentado
- **Conocimiento**: Cada función tiene un propósito educativo
- **Futuro**: Tecnología de vanguardia para formar campeones del mañana

---

**¡DOJOIA está listo para transformar la educación! 🥋✨**

*Built with passion by the DOJOIA team*
