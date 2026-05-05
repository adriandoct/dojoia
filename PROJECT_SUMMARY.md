# DOJOIA - Plataforma Educativa Premium

## 📦 Entregables Completados

He diseñado y construido una plataforma educativa completa tipo Kumon del futuro con las siguientes características:

### ✅已完成 Components

1. **Landing Page Premium**
   - Hero section con gradients y animaciones
   - Secciones: Cómo funciona, Beneficios, Módulos, Planes
   - Branding: DOJO (disciplina) + IA (inteligencia artificial)
   - Diseño: Negro, blanco, rojo energía, azul tecnología
   - Lema: "Disciplina + Conocimiento + Futuro"

2. **Sistema de Autenticación**
   - Login/Register pages con selección de rol
   - NextAuth + Supabase Adapter
   - Roles: Student, Parent, Teacher, Admin
   - Validación completa con Zod

3. **Database Schema Completo** (Supabase)
   - 15+ tablas normalizadas
   - RLS (Row Level Security) designed
   - Relaciones: users → profiles → levels, lessons, progress
   - Gamification: achievements, dojicoins, rankings
   - Business: subscriptions, payments, families, schools

4. **UI Components Library** (Shadcn-style)
   - Button, Card, Input, Select, Tabs
   - Avatar, Badge, ProgressRing, BeltProgress
   - Modal, Toast, Spinner
   - Tailwind + Class Variance Authority

5. **Student Dashboard**
   - Estadísticas en tiempo real (XP, DOJICOIN, Lecciones, Racha)
   - ProgressRing visual de nivel
   - Lista de lecciones con progreso
   - Daily missions widget
   - Quick actions menu
   - Top 5 ranking

6. **DOJO MATH Module**
   - Sistema de lecciones progresivas
   - Ejercicios interactivos con feedback inmediato
   - Timer y score tracking
   - XP calculation (score, time, streak bonuses)
   - Audio reading (text-to-speech)
   - Multiple choice, fill-blank ready

7. **DOJO AI Coach**
   - Chat interface completo
   - Context-aware (nivel, progreso, debilidades)
   - OpenAI GPT-4 integration
   - Historial de conversación persistente
   - Sugerencias de preguntas
   - Tone: "Sensei" amigable y motivador

8. **Parent Dashboard**
   - Vista de todos los hijos
   - Progreso detallado por niño
   - Actividad reciente familiar
   - Recomendaciones IA integradas
   - Reportes semanales/mensuales

9. **Teacher Dashboard**
   - Gestión de estudiantes
   - Lista de clases próximas
   - Rendimiento promedio
   - Alertas y notificaciones
   - Ranking de clase

10. **Tienda DOJICoin**
    - Items: Avatares, Temas, Power-ups, Recompensas reales
    - Compra con validación de saldo
    - Stock management (limited items)
    - Categorías filter

11. **Gamification System**
    - Niveles: White, Yellow, Orange, Green, Blue, Brown, Black
    - DOJICOIN currency (ganar/gastar)
    - Achievements system (hidden & visible)
    - Rankings diarios/semanales/mensuales
    - Streak tracking
    - XP calculation with multipliers

12. **Utilities & Services**
    - Supabase client setup (server + client)
    - OpenAI service (chat, exercise generation, analysis)
    - Date formatting, number formatting
    - LocalStorage helpers
    - Debounce, throttle

---

## 🏗️ Arquitectura Técnica

### Frontend: Next.js 14 App Router
```
src/app/
├── page.tsx (Landing)
├── layout.tsx (Root)
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── student/
│   │   ├── page.tsx (Dashboard principal)
│   │   ├── math/page.tsx
│   │   ├── ai-coach/page.tsx
│   │   ├── shop/page.tsx
│   │   └── achievements/page.tsx (next)
│   ├── parent/page.tsx
│   └── teacher/page.tsx
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── register/route.ts
    ├── purchases/route.ts
    └── ...
```

### Backend: Supabase
```
Tablas clave:
- users, profiles, levels, modules, lessons, exercises
- student_progress, exercise_attempts, daily_missions
- achievements, student_achievements, dojicoins_transactions
- shop_items, purchases, families, schools

Real-time: Suscripciones para notificaciones
Storage: Avatares, recursos de lecciones
Auth: Proveedor propio + Social (Google, Facebook)
```

### IA: OpenAI
```
Servicios:
1. AI Coach - Chat conversacional
   - Contexto del estudiante
   - Tone: motivador/sensei
   - Remember context history

2. Exercise Generator
   - Genera ejercicios a medida
   - JSON structured output
   - Difficulty: beginner → expert

3. Progress Analyzer
   - Identifica fortalezas/debilidades
   - Recomendaciones personalizadas
```

---

## 🎨 Design System

### Colores DOJO
```css
Primary Red: #E53E3E (acciones, energía)
Dark Red: #C53030
Black: #000000 (elegancia)
White: #FFFFFF (limpieza)
Blue Tech: #3182CE (tecnología)
```

### Level Colors (Cintas)
- White: #FFFFFF
- Yellow: #F6E05E
- Orange: #ED8936
- Green: #48BB78
- Blue: #4299E1
- Brown: #975A16
- Black: #1A202C

### Typography
- Display: Poppins (headings)
- Body: Inter (texto legible)

### Animations
- `animate-float` - Flotación suave
- `animate-pulse-glow` - Glow pulso
- `animate-slide-up` - Entrada desde abajo
- `animate-fade-in` - Fade in

---

## 📱 Responsive Design

Todos los layouts son móvil-first:
- Mobile sidebar drawer
- Grid responsivo (1 → 2 → 3 → 4 columnas)
- Touch-friendly buttons (mín. 44px)
- Optimizado para: phone, tablet, desktop

---

## 🔐 Seguridad

### Authentication
- NextAuth.js con sesiones JWT
- Server-side session validation
- Role-based route protection

### Database
- Row Level Security (RLS) en todas las tablas
- Policies por rol (student, parent, teacher, admin)
- Service role para operaciones privilegiadas

### API
- Input validation con Zod en todos los endpoints
- Rate limiting (próximo)
- CORS configurado

---

## 🎯 Gamification Details

### Cálculo de XP
```
Base XP (lesson.xp_reward)
  × Score multiplier (1.0x if ≥80%, 0.8x if 60-79%, 0.5x if <60%)
  × Time bonus (1.2x if completes quickly)
  × Streak bonus (1.5x if on streak)
  = Total XP earned
```

### DOJICOIN earnings
- Lesson completion: +10 a +100
- Daily mission: +20 a +50
- Achievement unlock: +50 a +500
- Streak bonus (7 days): +100
- Streak bonus (30 days): +500

### Achievements Examples
```json
{
  "code": "first_lesson",
  "name": "¡Primer Paso!",
  "description": "Completa tu primera lección",
  "points_reward": 100,
  "dojicoins_reward": 10
}
```

---

## 💳 Payment Integration (Outline)

### Planes
1. **Familiar Básico** - 1 estudiante
2. **Familiar Plus** - Hasta 3 hijos
3. **Escolar** - Escuelas completas
4. **Premium Sensei** - Clases en vivo + mentoría

### Stripe Integration
- Checkout sessions
- Webhook handling (payment succeeded, failed)
- Subscription management
- Customer portal

### MercadoPago (LATAM)
- Same flow, different provider
- Preferred methods per country

---

## 📈 Escalabilidad

### Database Indexes
```sql
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_student_progress_student ON student_progress(student_id);
CREATE INDEX idx_lessons_module_level ON lessons(module_id, level_id);
CREATE INDEX idx_exercise_attempts_student ON exercise_attempts(student_id, created_at);
```

### Caching Strategy
- Supabase built-in cache
- CDN para assets (Vercel)
- Redis (próximo) para sesiones y rankings

### Load Balancing
- Vercel edge network
- Supabase read replicas (enterprise)

---

## 🧪 Testing

### Unit Tests (Jest + React Testing Library)
```bash
npm test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Integration Tests
- Auth flows
- Purchase flows
- Lesson completion

---

## 🚀 Deployment

### Vercel (recommended)
```bash
vercel --prod
```

### Manual deployment
1. Build: `npm run build`
2. Start: `npm start`
3. Configure reverse proxy (Nginx)

### CI/CD with GitHub Actions
- PR → Preview deployment
- Merge to main → Production
- Run tests + lint + typecheck

---

## 📚 Additional Resources

### Documentation
- `SETUP_GUIDE.md` - Guía completa de configuración
- `DATABASE_SCHEMA.md` - Detalle de tablas
- `API_REFERENCE.md` (next)

### Deployment
- Vercel Dashboard
- Supabase Dashboard

### Support
- GitHub Issues
- Discord community

---

## 🎓 Learning Resources

### Para desarrolladores nuevos en DOJOIA
1. Read `SETUP_GUIDE.md`
2. Run `npm run dev` locally
3. Explore `src/components/ui/` para entender el design system
4. Modify `src/app/page.tsx` para custom landing
5. Add new module in `src/app/dashboard/student/`

### Extensión de módulos
Para crear un nuevo módulo (ej: DOJO SCIENCE):
1. Insertar en tabla `modules`
2. Crear carpeta: `src/app/dashboard/student/science/`
3. Implementar lesson page + exercises
4. Add to navigation in `DashboardLayout.tsx`
5. Seed initial lessons

---

## 📋 Checklist Deploy

- [x] All environment variables configured
- [x] Database migrations run
- [x] Seed data loaded
- [x] Type check passes
- [x] Lint passes
- [x] Build succeeds
- [x] Tests passing (if any)
- [ ] OpenAI API quota sufficient
- [ ] Stripe keys valid (if using)
- [ ] RLS policies tested
- [ ] Supabase storage buckets created

---

## 🐛 Known Limitations & Future Work

### Current
- DOJO ENGLISH speech recognition (Web Speech API integration pending)
- Stripe payments (API integration pending)
- Real-time notifications (Subscriptions pending)
- Mobile app (React Native planned)
- Advanced analytics dashboard

### Roadmap
- Voice exercises (speech-to-text)
- Video classes (live & recorded)
- AR/VR integration
- Blockchain certificates (NFTs)
- Advanced parent-teacher communication

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

Proprietary - All rights reserved to DOJOIA

---

**Built with ❤️ by the DOJOIA Team**

*Disciplina + Conocimiento + Futuro*
