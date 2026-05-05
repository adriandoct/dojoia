# 🚀 DOJOIA - Getting Started

## 📦 Repositorio

**GitHub:** https://github.com/adriandoct/dojoia.git
**Plataforma:** Next.js 14 + TypeScript + Supabase + OpenAI

---

## ⚡ Inicio Rápido (5 minutos)

### 1. Clonar e instalar

```bash
git clone https://github.com/adriandoct/dojoia.git
cd dojoia
npm install
```

### 2. Configurar variables de entorno

```bash
# Copia el template
cp .env.local.example .env.local

# Edita .env.local con tus claves:
# - Supabase: Settings → API
# - OpenAI: platform.openai.com/api-keys
# - Stripe: dashboard.stripe.com/apikeys
# - NextAuth: openssl rand -base64 32
```

Variables críticas:
```env
NEXT_PUBLIC_SUPABASE_URL=https://vikgeidbjpnotwtdzkix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=pk_live_...
OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
```

### 3. Configurar base de datos

```bash
# Opción A: Supabase CLI
npm install -g supabase
supabase login
supabase link --project-ref vikgeidbjpnotwtdzkix
supabase db push

# Opción B: Manual
# Ve a https://vikgeidbjpnotwtdzkix.supabase.co
# SQL Editor → pega contenido de supabase/migrations/01_create_tables.sql
# Luego pega contenido de 02_policies_functions.sql
```

### 4. Insertar datos iniciales

```bash
npx tsx supabase/seed.ts
```

### 5. Ejecutar

```bash
npm run dev
```

Abre: http://localhost:3000

---

## 📖 Documentación

- **`README.md`** - Visión general del proyecto
- **`SETUP_GUIDE.md`** - Guía completa de configuración (20+ páginas)
- **`DATABASE_SCHEMA.md`** - Esquema de base de datos
- **`INDEX.md`** - Documentación técnica completa
- **`CONNECT_GUIDE.md`** - Conexión a Supabase paso a paso
- **`PROJECT_STATUS.md`** - Estado actual y roadmap

---

## 🗄️ Base de Datos

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Autenticación (email, role) |
| `profiles` | Datos del estudiante/padre/maestro |
| `levels` | 7 niveles (cintas white→black) |
| `modules` | 7 módulos educativos |
| `lessons` | Lecciones individuales |
| `exercises` | Ejercicios por lección |
| `student_progress` | Progreso por estudiante |
| `achievements` | Logros/insignias |
| `dojicoins_transactions` | Moneda interna |
| `shop_items` | Tienda |
| `subscriptions` | Planes de pago |

### Relaciones clave

```
users (1) → (1) profiles
profiles (N) → (1) levels
profiles (N) → (N) lessons via student_progress
lessons (1) → (N) exercises
modules (1) → (N) lessons
```

---

## 🎨 Design System

### Colores DOJO

```css
Primary: #E53E3E (rojo dojo)
Black: #000000
White: #FFFFFF
Blue: #3182CE (tech)
```

### Level Colors

| Level | Color |
|-------|-------|
| White | #FFFFFF |
| Yellow | #F6E05E |
| Orange | #ED8936 |
| Green | #48BB78 |
| Blue | #4299E1 |
| Brown | #975A16 |
| Black | #1A202C |

### Typography
- Display: Poppins (headings)
- Body: Inter (text)

---

## 🧩 Módulos Implementados

### DOJO MATH ✅
- Lecciones progresivas
- Ejercicios multiple-choice
- Feedback inmediato
- XP calculation
- Audio reading (TTS)
- Timer y streaks

### AI Coach ✅
- Chat interface completo
- GPT-4 integration
- Context-aware (level, progress, weaknesses)
- Historial persistente
- Tone: Sensei motivador

### Student Dashboard ✅
- Stats overview (XP, DOJICOIN, lessons, streak)
- ProgressRing visual
- Recent lessons list
- Daily missions widget
- Quick actions
- Top 5 ranking

### Parent Dashboard ✅
- Children overview
- Individual progress
- Activity feed
- AI recommendations
- Weekly reports button

### Teacher Dashboard ✅
- Students list
- Class schedule
- Performance metrics
- Quick actions
- Notifications
- Class ranking

### Shop ✅
- Categories: avatars, themes, power-ups, real
- Cart functionality
- DOJICOIN balance check
- Purchase flow
- Stock management

---

## 💳 Pagos con Stripe

### Planes

| Plan | Precio | Estudiantes |
|------|--------|-------------|
| Familiar Básico | $199/mes | 1 |
| Familiar Plus | $349/mes | 3 |
| Escolar | $999/mes | 100 |
| Premium Sensei | $599/mes | 1 + clases en vivo |

### Features
- ✅ Checkout Session creation
- ✅ Webhook handling
- ✅ Subscription management
- ✅ Invoice tracking
- ✅ Payment failure handling
- ✅ Cancel at period end

---

## 🤖 AI Services

### OpenAI Integration

```typescript
import { generateAIResponse } from '@/lib/services/openai'

const response = await generateAIResponse({
  studentProfile: { name, level, interests, weaknesses },
  currentLesson: { title, module, description },
  recentProgress: { lessonsCompleted, averageScore, streakDays },
  conversationHistory: [...messages],
}, userMessage)
```

### Capabilities
- ✅ Educational assistant (24/7)
- ✅ Exercise generation (JSON output)
- ✅ Progress analysis
- ✅ Personalized recommendations
- ✅ Motivational messages

---

## 🔐 Autenticación

### Roles

| Role | Descripción | Acceso |
|------|-------------|--------|
| `student` | Niño/joven estudiante | Dashboard student, todos módulos |
| `parent` | Padre/madre | Panel padres, progreso hijos |
| `teacher` | Maestro | Gestión estudiantes, clases |
| `admin` | Administrador | Todo el sistema |

### Flujo
1. Register → Select role
2. NextAuth session (JWT)
3. Protected routes middleware
4. Supabase RLS policies por rol

---

## 🎮 Gamification

### DOJICOIN Earnings
- Complete lesson: +10 a +100
- Daily mission: +20 a +50
- Achievement: +50 a +500
- 7-day streak: +100 bonus
- 30-day streak: +500 bonus

### Level Progression
```
White: 0 - 1,000 XP
Yellow: 1,000 - 2,500 XP
Orange: 2,500 - 5,000 XP
Green: 5,000 - 10,000 XP
Blue: 10,000 - 20,000 XP
Brown: 20,000 - 40,000 XP
Black: 40,000 - 100,000 XP
```

### Achievements (Examples)
- `first_lesson` - Completa primera lección
- `streak_7` - 7 días consecutivos
- `xp_1000` - 1,000 XP totales
- `level_up` - Subir de nivel
- `perfect_score` - 100% en lección

---

## 📁 Estructura de Carpetas

```
dojoia/
├── src/
│   ├── app/                    # Next.js pages (App Router)
│   │   ├── (auth)/            # Login, Register
│   │   ├── (dashboard)/       # Dashboards por rol
│   │   ├── api/               # API routes
│   │   └── pricing/           # Stripe pricing page
│   ├── components/
│   │   ├── ui/                # Shadcn-style components
│   │   ├── layout/            # DashboardLayout
│   │   └── providers/         # AuthProvider
│   ├── lib/
│   │   ├── services/          # OpenAI, Stripe
│   │   ├── supabase/          # DB clients
│   │   └── utils/             # Helpers
│   └── types/                 # TypeScript definitions
├── supabase/
│   ├── migrations/            # SQL migrations
│   └── seed.ts                # Initial data
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 🛠️ Scripts Útiles

```bash
# Development
npm run dev              # http://localhost:3000
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript check

# Database
npx supabase db push     # Apply migrations
npx supabase studio      # Open database GUI
npx tsx supabase/seed.ts # Insert sample data

# Git
git status
git add .
git commit -m "message"
git push origin main
```

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection failed
```bash
# Verify .env.local
cat .env.local | grep SUPABASE

# Test connection
curl https://vikgeidbjpnotwtdzkix.supabase.co/rest/v1/
```

### RLS policy violations
```sql
-- Temporarily disable to debug
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### OpenAI errors
```bash
# Check API key
echo $OPENAI_API_KEY

# Verify balance at platform.openai.com/usage
```

---

## 📱 Mobile (Future)

Plan: React Native + Expo

```bash
# Próximo repositorio
dojoia-mobile/
├── app/
├── components/
├── services/
├── navigation/
└── assets/
```

Features:
- Offline lessons
- Speech recognition (English)
- AR karate moves
- Push notifications
- Cloud sync

---

## 🎯 Milestones

### ✅ Completed (Phase 1)
- [x] Project setup & architecture
- [x] Database schema (20+ tables)
- [x] Authentication system
- [x] Landing page
- [x] Student dashboard
- [x] DOJO MATH module
- [x] AI Coach (OpenAI)
- [x] Parent dashboard
- [x] Teacher dashboard
- [x] Shop + DOJICOIN
- [x] Stripe payments
- [x] Gamification system
- [x] Documentation complete

### 🔄 In Progress (Phase 2)
- [ ] DOJO ENGLISH module
- [ ] DOJO CODE module
- [ ] Real-time notifications
- [ ] Advanced analytics

### 📅 Planned (Phase 3+)
- [ ] Mobile app
- [ ] Live streaming
- [ ] AR/VR features
- [ ] Blockchain certificates

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📞 Support

- **GitHub Issues:** https://github.com/adriandoct/dojoia/issues
- **Email:** hola@dojoia.com
- **Discord:** Coming soon

---

**¡Bienvenido a DOJOIA! 🥋✨**

*Transformando la educación con disciplina, conocimiento y futuro.*
