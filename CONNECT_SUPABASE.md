# DOJOIA - Supabase Connection Setup

## 📋 Project Configuration

**Supabase URL:** https://vikgeidbjpnotwtdzkix.supabase.co
**Publishable Key:** pk_live_... (provided separately for security)

## 🔧 Next Steps to Connect Your Project

### 1. Update Environment Variables

Edita tu archivo `.env.local` con las credenciales reales de tu proyecto:

```env
# Supabase (TU PROYECTO)
NEXT_PUBLIC_SUPABASE_URL=https://vikgeidbjpnotwtdzkix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=pk_live_H8jKLZuob8f7SmtFt8bKYQ_V9L6HH__ # Revisa si es anon o publishable
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpa2dlaWRqanBub3R3ZHR6aWt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkxNTg0MCwiZXhwIjoyMDYzNDkxODQwfQ.PKBZ8H4q8KXYl6GJK9QxUQW7YOji2Zt42pM0FjUXByI # Obtén de Settings > API

# OpenAI (si no lo tienes)
OPENAI_API_KEY=sk-proj-...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera_un_seguro_32_bytes_con_openssl_rand_base64_32

# Stripe (tu clave proporcionada)
STRIPE_PUBLISHABLE_KEY=sb_publishable_H8jKLZuob8f7SmtFt8bKYQ_V9L6HH__
STRIPE_SECRET_KEY=sk_live_... # Consíguela de Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_... # Configura en Stripe Dashboard

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DOJOIA
```

> ⚠️ **IMPORTANTE:** La clave que me diste parece ser una **Stripe publishable key**, no la Supabase anon key. Necesitas:
> 1. Ve a tu proyecto Supabase → Settings → API
> 2. Copia la `anon public` key (empieza con `eyJ...`)
> 3. Pégala en `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Ejecutar Migraciones en Supabase

```bash
# Opción A: Usando Supabase CLI (recomendado)
supabase login
supabase link --project-ref vikgeidbjpnotwtdzkix
supabase db push

# Opción B: Manual desde Supabase Studio
# Ve a https://vikgeidbjpnotwtdzkix.supabase.co
# Ve a SQL Editor
# Copia y pega el contenido de supabase/migrations/01_create_tables.sql
# Ejecuta
# Luego ejecuta 02_policies_functions.sql
```

### 3. Configurar Storage en Supabase

En Supabase Dashboard → Storage:

1. **Crear buckets:**
   - `avatars` (público, file size limit 5MB)
   - `lesson-assets` (privado, 50MB)
   - `shop-images` (público, 5MB)

2. **Configurar políticas de seguridad** para cada bucket (usar las plantillas)

3. **CORS** → Agregar `http://localhost:3000` y tu dominio de producción

### 4. Configurar Auth Providers (Opcional pero recomendado)

En Supabase Dashboard → Authentication → Providers:

1. **Google OAuth:**
   - Ve a Google Cloud Console
   - Crea OAuth 2.0 credentials
   - Redirect URI: `https://vikgeidbjpnotwtdzkix.supabase.co/auth/v1/callback`
   - Copia Client ID y Secret a Supabase

2. **Email/Password:**
   - Ya está habilitado por defecto

### 5. Seed Database (Datos Iniciales)

```bash
# Después de conectar el proyecto
npx tsx supabase/seed.ts
```

Esto insertará:
- ✅ 7 Niveles (cintas)
- ✅ 7 Módulos
- ✅ 15+ Lecciones de ejemplo
- ✅ 50+ Ejercicios
- ✅ Logros (achievements)
- ✅ Items de tienda

### 6. Configurar Stripe

1. Crea cuenta en https://stripe.com
2. Ve a Developers → API Keys
3. Copia:
   - Publishable key (ya la tienes: `sb_publishable_...`)
   - Secret key (`sk_live_...`)
   - Webhook signing secret

4. Configura webhook en Stripe Dashboard:
   - Endpoint: `https://tu-dominio.com/api/webhooks/stripe`
   - Events: `invoice.paid, invoice.payment_failed, customer.subscription.created, customer.subscription.deleted`

5. Agrega claves a `.env.local`

### 7. Ejecutar Localmente

```bash
# Instala dependencias (si no lo has hecho)
npm install

# Verifica que todo esté bien
npm run typecheck
npm run lint

# Inicia desarrollo
npm run dev
```

Visita: http://localhost:3000

---

## 🗄️ Verificar Base de Datos

Después de ejecutar las migraciones, verifica en Supabase Studio que existan:

```sql
-- Conéctate a tu BD y ejecuta:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deberías ver:
-- achievements
-- ai_conversations
-- ai_messages
-- daily_missions
-- dojicoins_transactions
-- exercise_attempts
-- exercises
-- families
-- family_members
-- lessons
-- levels
-- modules
-- notifications
-- payments
-- profiles
-- purchases
-- rankings
-- school_students
-- school_teachers
-- schools
-- student_achievements
-- student_progress
-- subscriptions
-- users
-- videos, articles, books (opcional)
```

---

## 🔍 Troubleshooting Conexión

### Error: "invalid api key"
```bash
# Verifica que la anon key esté correcta
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# En Supabase Dashboard:
# Settings → API → Copy `anon public` key (NO la service key en el frontend)
```

### Error: "relation does not exist"
```bash
# Las migraciones no se ejecutaron correctamente
# Ve a SQL Editor en Supabase y ejecuta manualmente los scripts
```

### Error: "permission denied for relation"
```sql
-- RLS está bloqueando
-- Temporalmente deshabilita RLS para probar:
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- Si funciona, necesitas ajustar las policies en 02_policies_functions.sql
```

---

## 📊 Probar Funcionalidad

Una vez configurado:

1. **Registrar usuario de prueba:**
   - Ve a http://localhost:3000/register
   - Crea cuenta como "Estudiante"
   - Debería crear perfil automáticamente

2. **Verificar Dashboard:**
   - Login → Dashboard student
   - Debería mostrar XP, DOJICOIN, lecciones

3. **Probar DOJO MATH:**
   - Click en módulo Math
   - Debería cargar lecciones
   - Responde ejercicio → Debería guardar progreso

4. **Probar AI Coach:**
   - Ve a AI Coach tab
   - Envía mensaje → Debería responder GPT-4

5. **Supabase Studio:**
   - Ejecuta `supabase studio` o ve a URL de Supabase
   - Verifica tablas con datos

---

## 🚀 Despliegue a Producción

### Vercel

```bash
# Instala Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# O conecta GitHub repo para auto-deploy
```

**Variables de entorno en Vercel:**
Ve a Project Settings → Environment Variables y agrega todas las variables de `.env.local`

### Dominio Personalizado

1. En Vercel: Agregar dominio
2. En Supabase: Settings → Custom Domain (agregar dominio)
3. Actualizar `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL`

---

## 📞 Soporte

Si tienes problemas:

1. **Verifica logs:**
   ```bash
   npm run dev  # Ver errores en consola
   ```

2. **Supabase logs:**
   - Supabase Dashboard → Logs
   - Filtra por "error"

3. **Network tab:**
   - Chrome DevTools → Network
   - Filtra peticiones a `/api/`

4. **Abre issue en GitHub** (si este es un proyecto público)

---

## ✅ Checklist de Configuración

- [ ] `.env.local` con TODAS las claves configuradas
- [ ] `npm install` completado sin errores
- [ ] `npx tsx supabase/seed.ts` ejecutado exitosamente
- [ ] `supabase db push` (migraciones aplicadas)
- [ ] Storage buckets creados
- [ ] Auth providers configurados (Google, email)
- [ ] `npm run dev` funciona
- [ ] Puedes registrarte y hacer login
- [ ] Dashboard carga con datos
- [ ] Puedes completar una lección
- [ ] DOJICOIN se acredita
- [ ] AI Coach responde

---

**¿Necesitas ayuda adicional?**
- Revisa `SETUP_GUIDE.md`
- Consulta `INDEX.md`
- Supabase Docs: https://supabase.io/docs
- DOJOIA Team: hola@dojoia.com

🎉 **¡Ahora DOJOIA está conectado a tu Supabase!**
