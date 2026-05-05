# DOJOIA - Deploy en Render

## 📦 Plataforma: Render.com

Render es una plataforma de hosting cloud que soporta:
- ✅ Next.js applications
- ✅ PostgreSQL databases
- ✅ Static sites
- ✅ Background workers
- ✅ SSL automático
- ✅ Auto-deploy desde GitHub

---

## 🚀 Pasos para Desplegar en Render

### 1. Preparar el Repositorio

Tu código ya está en GitHub: https://github.com/adriandoct/dojoia.git

Render va a detectar automáticamente que es una app Next.js.

### 2. Crear Cuenta en Render

1. Ve a https://render.com
2. Sign up (puedes usar GitHub account)
3. Verifica tu email

### 3. Crear Nuevo Web Service

1. En Dashboard → "New" → "Web Service"
2. Conectar GitHub repository:
   - Busca "dojoia"
   - Click "Connect"
3. Configuración:

**Nombre:** `dojoia` (o `dojoia-web`)
**Environment:** `Node`
**Region:** Choose closest (Oregon/Iowa)
**Branch:** `main`
**Root Directory:** (dejar vacío)

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### 4. Configurar Environment Variables

En Render Dashboard → tu servicio → "Environment" → "Add Environment Variable":

```
NEXT_PUBLIC_SUPABASE_URL=https://vikgeidbjpnotwtdzkix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=pk_live_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

OPENAI_API_KEY=sk-...

NEXTAUTH_SECRET=tu_seguro_generado
NEXTAUTH_URL=https://tu-servicio.onrender.com

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=sb_publishable_...
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_PRICE_FAMILY_BASIC=price_...
STRIPE_PRICE_FAMILY_PLUS=price_...
STRIPE_PRICE_SCHOOL=price_...
STRIPE_PRICE_PREMIUM_SENSEI=price_...

NEXT_PUBLIC_APP_URL=https://tu-servicio.onrender.com
NODE_ENV=production
```

⚠️ **IMPORTANTE:** 
- `NEXTAUTH_SECRET`: Genera con `openssl rand -base64 32`
- Los Stripe Price IDs créalos en tu Stripe Dashboard
- El `NEXTAUTH_URL` será la URL que te dé Render (ej: `https://dojoia.onrender.com`)

### 5. Configurar PostgreSQL ( DATABASE EN RENDER )

Render también ofrece PostgreSQL como servicio:

1. Dashboard → "New" → "PostgreSQL"
2. Configuración:
   - Name: `dojoia-db`
   - Database: `dojoia`
   - User: (auto-generado)
   - Region: Same as web service
   - Plan: Free (7 days) o Starter ($7/mes)

3. Una vez creado, ve a "Connection Info":
   - Host: `dojoia-db.onrender.com`
   - Port: `5432`
   - Database: `dojoia`
   - User: `dojoia_user`
   - Password: (click "Copy" para copiar)

4. **Setear variables de entorno** en tu Web Service:

```env
# En lugar de Supabase, si usas Render PostgreSQL directo:
DATABASE_URL=postgresql://dojoia_user:password@dojoia-db.onrender.com:5432/dojoia

# Pero como ya usas Supabase, no necesitas esto.
# Solo asegúrate que SUPABASE_URL y keys estén bien.
```

### 6. Desplegar

1. Click "Create Web Service"
2. Render va a:
   - Clonar tu repo
   - Instalar dependencias
   - Ejecutar build
   - Deploy automático
3. Espera ~5-10 minutos
4. URL pública: `https://dojoia.onrender.com` (o similar)

### 7. Configurar Supabase para Producción

Aunque tu app corre en Render, la base de datos sigue en Supabase (que ya está configurada).

En Supabase Dashboard:
1. Settings → API → "JWT Settings"
2. En "Site URL" agrega: `https://tu-servicio.onrender.com`
3. En "Redirect URLs" agrega: `https://tu-servicio.onrender.com/api/auth/callback/*`

En Supabase → Authentication → URL Configuration:
- Site URL: `https://tu-servicio.onrender.com`
- Redirect URLs: `https://tu-servicio.onrender.com/**`

### 8. Configurar Stripe Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint:
   - URL: `https://tu-servicio.onrender.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
   - Copy webhook signing secret
3. Agrega a Render environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 9. Configurar Storage en Supabase

Ya debiste hacerlo localmente, pero para producción:

1. Supabase → Storage
2. 3 buckets: `avatars`, `lesson-assets`, `shop-images`
3. Policies (como en migraciones)

### 10. Verificar Despliegue

Una vez deployado:

1. Visita `https://tu-servicio.onrender.com`
2. Deberías ver landing page
3. Registra un usuario de prueba
4. Login
5. Dashboard carga
6. DOJO MATH funciona
7. AI Coach responde

---

## 🔄 Auto-Deploy con GitHub

Render se conecta a tu GitHub repo:
- Cada push a `main` → auto-deploy
- puedes configurar branch保护
- Preview deployments para PRs

Configuración:
1. En tu servicio en Render → "Settings"
2. Auto-Deploy: Enable
3. Branch: `main`

---

## 📊 Monitoreo

Render Dashboard → tu servicio:

- **Metrics:** CPU, Memory, response time
- **Logs:** Ve logs en tiempo real
- **Events:** Deploy history
- **Shell:** Acceso SSH al contenedor

---

## 🐛 Troubleshooting

### "Build failed"
```bash
# Ve los logs en Render Dashboard
# Comunes:
# - Missing env vars
# - npm install falla
# - Build errors in Next.js
```

### "Cannot find module"
```bash
# Asegura que package.json esté commit
git add package.json package-lock.json
git commit -m "fix: lock dependencies"
git push
```

### Database connection errors
```bash
# Verifica Supabase URL/keys en environment variables
# En Render Shell:
$ echo $NEXT_PUBLIC_SUPABASE_URL
$ echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection:
$ curl https://vikgeidbjpnotwtdzkix.supabase.co/rest/v1/
```

### RLS policy violations
```sql
-- En Supabase Studio, ejecuta temporalmente:
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- Y reintenta la operación
-- Si funciona, ajusta las policies
```

### OpenAI errors
```bash
# Verifica API key
echo $OPENAI_API_KEY | head -c 10
# Debe ser sk-...

# Verifica saldo en OpenAI Dashboard
```

---

## 🔧 Configuración Avanzada

### Custom Domain

1. Render → Service → Settings → Custom Domain
2. Add domain: `dojoia.com` (o subdomain)
3. APunta tu domain's DNS a los nameservers de Render
4. SSL automático (Let's Encrypt)

### Background Workers (para tareas asíncronas)

Puedes crear un Worker en Render para:

- Envío de emails (Resend/SendGrid)
- Procesamiento de analytics
- Generación de reportes PDF
- Tareas programadas (cron)

Ejemplo `worker.js`:
```javascript
// Importar cola de tareas (BullMQ, etc.)
// Procesar emails asíncronos
```

Crear en Render: New → Background Worker

### Cron Jobs (Scheduled Tasks)

Render soporta cron:

Configuración:
- Schedule: `0 0 * * *` (diario a medianoche)
- Command: `npm run update-rankings`

Tareas:
- Actualizar rankings diarios
- Enviar reportes semanales
- Limpiar datos viejos
- Recalcular niveles

---

## 💰 Costos en Render

### Free Tier
- Web Service: 750 hours/mes (~1 instancia continua)
- PostgreSQL: 90 days trial, luego $7/mes
- Static Sites: Free

### Paid (Starter)
- Web Service: $7/mes (512 MB RAM, 1 CPU)
- PostgreSQL: $7/mes (256 MB, 1 vCPU)
- Total aprox: $14-21/mes

**Recomendación:** Starter plan para producción estable.

---

## 📈 Optimizaciones para Render

### 1. Next.js Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vikgeidbjpnotwtdzkix.supabase.co',
      },
    ],
  },
}
```

### 2. Database Connection Pooling

Render recomienda usar Supabase connection pooling (ya viene configurado).

### 3. Caching

```typescript
// middleware.ts - Cache estático
export async function middleware(request) {
  // Cache of static assets
}
```

### 4. Reduce Build Time

```bash
# .render.yml (opcional)
services:
  - type: web
    name: dojoia
    env: node
    buildCommand: npm ci && npm run build
    # npm ci es más rápido que npm install
```

---

## 🔄 CI/CD con Render

Render auto-deploy en cada push a main.

Para más control, puedes usar GitHub Actions:

```yaml
# .github/workflows/deploy-render.yml
name: Deploy to Render
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        uses: renderexpert/deploy-to-render@v1
        with:
          serviceId: ${{ secrets.RENDER_SERVICE_ID }}
          apiKey: ${{ secrets.RENDER_API_KEY }}
```

---

## 📦 Archivos Adicionales para Render

### `render.yaml` (Infrastructure as Code)

```yaml
# render.yaml - Define todos los servicios
services:
  - type: web
    name: dojoia-web
    runtime: node
    plan: starter
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXTAUTH_URL
        fromService:
          type: web
          name: dojoia-web
          envVarKey: RENDER_EXTERNAL_URL
      - key: NEXTAUTH_SECRET
        generateValue: true
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false # Set in dashboard
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_PUBLISHABLE_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false

  - type: pserv
    name: dojoia-db
    runtime: node
    plan: starter
    database: postgresql
    disk:
      name: pgdata
      mountPath: /var/lib/postgresql/data
    # Not needed if using Supabase
```

Para deploy con `render.yaml`:
```bash
# Install Render CLI
npm install -g @render/cli

# Deploy
render deploy
```

---

## ✅ Checklist de Deploy en Render

**Antes de deploy:**
- [x] Código en GitHub (✅ listo)
- [x] .env.local con todas las claves
- [x] Migraciones ejecutadas en Supabase
- [x] Database seed ejecutado
- [x] Storage buckets configurados
- [x] Auth providers configurados (Google)

**Configuración Render:**
- [ ] Crear Web Service
- [ ] Configurar environment variables
- [ ] Configurar build command: `npm ci && npm run build`
- [ ] Configurar start command: `npm start`
- [ ] Conectar GitHub repo
- [ ] Deploy automático en main

**Post-deploy:**
- [ ] Verificar que la app carga
- [ ] Test registration/login
- [ ] Test DOJO MATH
- [ ] Test AI Coach
- [ ] Verificar logs en Render Dashboard
- [ ] Configurar custom domain (opcional)
- [ ] Configurar Stripe webhook
- [ ] Configurar SSL (automático en Render)
- [ ] Monitorear métricas

---

## 🐛 Problemas Comunes en Render

### 1. "Module not found"

**Causa:** Dependencias no instaladas

**Solución:**
```json
// package.json - Asegurar que no hay dependencias opcionales
"dependencies": {
  "next": "^14.2.5",
  "react": "^18.3.1",
  ...
}
```
```bash
# Commit package-lock.json
git add package-lock.json
git commit -m "fix: lock dependencies"
git push
```

### 2. "NEXTAUTH_URL mismatch"

**Causa:** NextAuth redirige a URL incorrecta

**Solución:** En environment variables:
```
NEXTAUTH_URL=https://tu-servicio.onrender.com
NEXT_PUBLIC_APP_URL=https://tu-servicio.onrender.com
```

### 3. "Supabase connection timeout"

**Causa:** Render blocks conexiones externas? No, pero puede haber latency.

**Solución:** Usar Supabase connection pooling (ya está en client.ts)

### 4. "Out of memory" en build

**Causa:** Build consume mucha RAM

**Solución:**
- Upgrade a Starter plan ($7/mes)
- O reduce bundle size (elimina módulos no usados)

### 5. Webhook 404

**Causa:** La ruta no existe o el servicio no corre

**Solución:**
1. Check logs: Render → Logs
2. Verifica que `api/webhooks/stripe` esté en `src/app/api/webhooks/stripe/route.ts`
3. Asegura start command: `npm start`

---

## 🔄 Deploy desde GitHub (Automático)

1. Push a `main` → Render detecta cambio
2. Auto-build
3. Auto-deploy
4. Notificación por email

Puedes configurar:
- **Branch protection** (requerir PRs)
- **Preview deployments** para PRs
- **Manual deploy** desde Dashboard

---

## 📊 Monitoreo en Render

### Logs

Dashboard → Service → Logs:
```
[build] installing dependencies
[build] build complete
[app] GET / 200 123ms
[app] POST /api/auth/login 200 45ms
[error] OpenAI API error...
```

### Metrics

Dashboard → Service → Metrics:
- Requests/sec
- Response time P95
- CPU/Memory usage
- Network I/O

### Alerts (Pro)

Puedes configurar alerts:
- CPU > 80%
- Memory > 90%
- Error rate > 5%
- Response time > 2s

---

## 🎯 Después del Deploy

### 1. Probar Flujo Completo

```
1. Visita https://tu-servicio.onrender.com
2. Click "Registrarse"
3. Crea cuenta como estudiante
4. Dashboard → debería mostrar datos
5. DOJO MATH → completar lección
6. Verificar XP incrementa
7. AI Coach → enviar mensaje
8. Tienda → ver items
```

### 2. Probar Stripe (Modo Test)

En Stripe Dashboard → Test mode:

1. Usa tarjeta de prueba: `4242 4242 4242 4242`
2. Cualquier fecha futura
3. CVC: `123`
4. Zip: `12345`

Debería:
- Crear checkout session
- Redirigir a success page
- Webhook recibido
- Subscription creada en DB

### 3. Probar OpenAI

AI Coach:
- Envía mensaje de prueba
- Debería responder GPT-4
- Verificar tokens usados (OpenAI Dashboard)

### 4. Verificar Base de Datos

Supabase Studio:
```sql
SELECT * FROM profiles LIMIT 5;
SELECT * FROM student_progress LIMIT 5;
SELECT * FROM dojicoins_transactions LIMIT 5;
```

### 5. Configurar Dominio Personalizado (Opcional)

Render → Service → Settings → Custom Domain:
```
Type: A
Hostname: @
IP: 76.76.21.21 (Render's IP)
```

O CNAME para subdomain:
```
Type: CNAME
Hostname: app
Value: tu-servicio.onrender.com
```

Luego agrega a `NEXTAUTH_URL`:
```
NEXTAUTH_URL=https://dojoia.com
NEXT_PUBLIC_APP_URL=https://dojoia.com
```

---

## 💾 Backup & Restore

### Backup Automático (Supabase)

Supabase ya hace backups diarios (7 days retention).

Para backup manual:
```bash
# Exportar datos
npx supabase db dump --local -f backup.sql

# O desde PGAdmin
```

### Restore
```bash
npx supabase db restore --local backup.sql
```

---

## 🔄 Actualizaciones

Cada vez que hagas `git push origin main`:

1. Render detecta cambio
2. Rebuild (instala dependencias)
3. Deploy nueva versión

**Zero downtime** si el build es exitoso.

---

## 📞 Soporte Render

- **Documentation:** https://render.com/docs
- **Status:** https://status.render.com
- **Support:** support@render.com

---

## 🎉 ¡Listo!

DOJOIA está configurado para deploy en Render.

**Comandos rápidos:**

```bash
# Desplegar ahora
git push origin main

# O manualmente desde dashboard.render.com
# 1. New Web Service
# 2. Connect GitHub
# 3. Set env vars
# 4. Deploy
```

**URL de ejemplo:**
`https://dojoia.onrender.com` (disponible después del primer deploy)

---

**¿Listo para lanzar DOJOIA al mundo? 🚀🥋**
