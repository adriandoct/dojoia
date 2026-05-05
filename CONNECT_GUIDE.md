# DOJOIA - Guía Rápida de Conexión a Supabase

## 🎯 Tu Proyecto Supabase

**URL:** https://vikgeidbjpnotwtdzkix.supabase.co
**Project Ref:** `vikgeidbjpnotwtdzkix`

---

## 📋 Pasos para Conectar

### Paso 1: Obtener Claves de Supabase

1. Ve a https://vikgeidbjpnotwtdzkix.supabase.co
2. Inicia sesión
3. En el panel izquierdo, ve a **Settings** → **API**
4. Copia las siguientes claves:

```env
# En .env.local
NEXT_PUBLIC_SUPABASE_URL=https://vikgeidbjpnotwtdzkix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...
```

⚠️ **IMPORTANTE:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` es la clave "anon public" (pk_live...)
- `SUPABASE_SERVICE_ROLE_KEY` es la clave "service_role" (eyJ...), **NUNCA** la expongas en el frontend
- Ambas claves están en la misma página de API

### Paso 2: Ejecutar Migraciones

Abre tu terminal en la carpeta del proyecto:

```bash
# Opción A: Usando Supabase CLI (más fácil)
npm install -g supabase
supabase login
supabase link --project-ref vikgeidbjpnotwtdzkix
supabase db push

# Opción B: Manual (usando SQL Editor)
# Ve a https://vikgeidbjpnotwtdzkix.supabase.co
# Click en "SQL Editor" en el menú izquierdo
# Crea una nueva query
# Copia el contenido de: supabase/migrations/01_create_tables.sql
# Pega y ejecuta
# Luego haz lo mismo con: supabase/migrations/02_policies_functions.sql
```

### Paso 3: Verificar que las Tablas Existen

En Supabase Studio → Table Editor, deberías ver:

- ✅ `profiles`
- ✅ `levels`
- ✅ `modules`
- ✅ `lessons`
- ✅ `exercises`
- ✅ `student_progress`
- ✅ `achievements`
- ✅ `dojicoins_transactions`
- ✅ `shop_items`
- ✅ etc.

Si no ves todas, ejecuta las migraciones nuevamente.

### Paso 4: Crear Storage Buckets

Ve a **Storage** en Supabase Dashboard:

1. Click **"New bucket"**
2. Crea 3 buckets:

**Bucket 1: `avatars`**
- Público: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

**Bucket 2: `lesson-assets`**
- Público: ❌ No (privado)
- File size limit: 50MB
- Para videos e imágenes de lecciones

**Bucket 3: `shop-images`**
- Público: ✅ Yes
- File size limit: 5MB
- Para imágenes de la tienda

### Paso 5: Configurar Policies de Storage

Cada bucket necesita policies. En cada bucket ve a **"Policies"** y crea:

**Para bucket `avatars` (público):**
```sql
-- Policy 1: Anyone can view
create policy "Public avatars are viewable by everyone"
on storage.objects for select
using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Policy 2: Users can upload own avatar
create policy "Users can upload own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid() = (storage.foldername(name))[1]
);
```

**Para `lesson-assets` (privado):**
```sql
-- Solo admins/teachers pueden subir/ver
create policy "Staff can manage lesson assets"
on storage.objects for all
using (
  bucket_id = 'lesson-assets'
  and auth.role() = 'authenticated'
  and exists (
    select 1 from profiles
    where user_id = auth.uid()
    and role in ('admin', 'teacher')
  )
);
```

**Para `shop-images` (público):**
```sql
-- Solo admins pueden subir, todos pueden ver
create policy "Public can view shop images"
on storage.objects for select
using (bucket_id = 'shop-images');

create policy "Admins can upload shop images"
on storage.objects for insert
with check (
  bucket_id = 'shop-images'
  and auth.role() = 'authenticated'
  and exists (
    select 1 from profiles
    where user_id = auth.uid()
    and role = 'admin'
  )
);
```

### Paso 6: Seed Database (Insertar Datos Iniciales)

```bash
# En tu terminal (después de tener .env.local configurado)
npx tsx supabase/seed.ts
```

Esto insertará:
- ✅ 7 Niveles (cintas white → black)
- ✅ 7 Módulos (Math, English, Code, Robotics, Karate, Read, Write)
- ✅ 15 Lecciones de ejemplo (principalmente Math nivel white)
- ✅ 50+ Ejercicios
- ✅ 4 Logros (achievements)
- ✅ 4 Items de tienda

### Paso 7: Verificar Autenticación

1. Ve a **Authentication** → **Providers**
2. Asegúrate que **Email** esté habilitado ✅
3. (Opcional) Configura Google OAuth:
   - Ve a Google Cloud Console
   - Crea credenciales OAuth 2.0
   - Redirect URI: `https://vikgeidbjpnotwtdzkix.supabase.co/auth/v1/callback`
   - Copia Client ID y Secret a Supabase

### Paso 8: Probar la Aplicación

```bash
# 1. Asegúrate que .env.local está completo
cat .env.local

# 2. Instala dependencias (si no lo has hecho)
npm install

# 3. Ejecuta servidor de desarrollo
npm run dev

# 4. Abre navegador
open http://localhost:3000
```

**Deberías ver:**
- Landing page de DOJOIA
- Botones de Login / Register
- Al registrarte, crea perfil automáticamente
- Dashboard con datos (XP, DOJICOIN, lecciones)
- Módulo DOJO MATH funcional

---

## 🔍 Troubleshooting

### Error: "Invalid API key"
```bash
# Verifica tus claves en .env.local
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# No debe estar la string literal "your_supabase..."
# Debe ser un valor real pk_live_... o eyJ...
```

### Error: "relation 'profiles' does not exist"
```bash
# Las migraciones no se ejecutaron
# Ve a SQL Editor en Supabase
# Executa manualmente:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- (luego pega todo el contenido de 01_create_tables.sql)
```

### Error: "new row violates row-level security policy"
```bash
# RLS está bloqueando inserts
# Temporalmente puedes deshabilitar (solo para debug):
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

# Si funciona, necesitas ajustar las policies
# en 02_policies_functions.sql
```

### No aparece nada en el dashboard después de registro
```bash
# Verifica que el trigger onCreate funcione
# En Supabase → Table Editor → profiles
# Debería haber una fila por cada usuario registrado

# Si no, verifica logs:
# Supabase → Logs → Filter: "auth"
# Busca errores
```

### `supabase db push` no funciona
```bash
# Instala Supabase CLI correctamente
npm install -g supabase
supabase --version

# Login
supabase login

# Link al proyecto
supabase link --project-ref vikgeidbjpnotwtdzkix

# Ahora db push
supabase db push
```

---

## 📊 Verificar que Todo Funciona

### Checklist de Verificación

- [ ] Landing page carga correctamente
- [ ] Puedo registrarme como estudiante
- [ ] Puedo hacer login
- [ ] Dashboard muestra mi perfil (nombre, nivel)
- [ ] Veo lecciones en DOJO MATH
- [ ] Puedo completar un ejercicio
- [ ] Mi XP aumenta
- [ ] DOJICOIN se acredita
- [ ] AI Coach responde
- [ ] En Supabase Studio veo datos en las tablas:
  - [ ] `profiles` tiene mi usuario
  - [ ] `student_progress` tiene mi progreso
  - [ ] `exercise_attempts` tiene mis respuestas
  - [ ] `dojicoins_transactions` tiene mis ganancias

### Comandos Útiles

```bash
# Ver logs de Next.js (errores en consola)
npm run dev

# Ver logs de Supabase
# Dashboard → Logs

# Ver estructura de DB
npx supabase db remote commit  # solo si tienes CLI configurado

# Resetear DB (CUIDADO - borra todo)
# Supabase Studio → SQL Editor:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Luego re-ejecuta migraciones
```

---

## 🚀 Siguientes Pasos

Una vez conectado:

1. **Configurar Stripe:**
   - Agrega Stripe keys a `.env.local`
   - Ve a Stripe Dashboard → Developers → Webhooks
   - Añade endpoint: `https://tu-dominio.com/api/webhooks/stripe`
   - Selecciona eventos: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`

2. **Configurar OpenAI:**
   - Agrega `OPENAI_API_KEY` a `.env.local`
   - AI Coach funcionará automáticamente

3. **Desplegar a producción:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit DOJOIA"
   git remote add origin https://github.com/tu-usuario/dojoia.git
   git push -u origin main
   
   # En Vercel:
   # - Import project from GitHub
   # - Set environment variables
   # - Deploy
   ```

4. **Configurar dominio personalizado (opcional):**
   - En Supabase: Settings → Custom Domain
   - En Vercel: Project Settings → Domains
   - Actualiza `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL`

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa logs** en Supabase Dashboard → Logs
2. **Abre issue** en GitHub con:
   - Error completo
   - Pasos para reproducir
   - Capturas de pantalla

3. **Contacta al equipo DOJOIA:**
   - Email: hola@dojoia.com
   - Discord: [próximamente]

---

**¡DOJOIA está listo para transformar la educación! 🥋✨**

Una vez completados estos pasos, tendrás una plataforma educativa funcionando con:
- ✅ Landing page
- ✅ Autenticación
- ✅ Dashboard student/parent/teacher
- ✅ DOJO MATH con ejercicios interactivos
- ✅ AI Coach con OpenAI
- ✅ Gamificación (DOJICOIN, niveles, logros)
- ✅ Tienda
- ✅ Sistema de pagos (Stripe)

**¿Todo listo?** Ejecuta `npm run dev` y empieza a usar DOJOIA.
