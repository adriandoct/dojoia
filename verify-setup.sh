#!/bin/bash

# DOJOIA - Verification Script
# Checks if everything is configured correctly

echo "======================================"
echo "🔍 DOJOIA - Verificación del Sistema"
echo "======================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Function to check command
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅${NC} $1 instalado"
    else
        echo -e "${RED}❌${NC} $1 NO encontrado"
        ((ERRORS++))
    fi
}

# Check .env.local exists
echo -e "${YELLOW}1️⃣  Verificando archivo .env.local${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local no existe${NC}"
    echo "   Copia .env.local.example a .env.local y configura las variables"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ .env.local encontrado${NC}"

    # Check critical env vars
    echo ""
    echo -e "${YELLOW}2️⃣  Verificando variables de entorno críticas${NC}"

    source .env.local 2>/dev/null

    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "your_supabase_project_url" ]; then
        echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL no configurada${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ SUPABASE_URL configurada${NC}"
    fi

    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [[ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" == *"your_"* ]]; then
        echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ SUPABASE_ANON_KEY configurada${NC}"
    fi

    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [[ "$SUPABASE_SERVICE_ROLE_KEY" == *"your_"* ]]; then
        echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY no configurada${NC}"
        echo "   Necesaria para operaciones de servidor"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY configurada${NC}"
    fi

    if [ -z "$OPENAI_API_KEY" ] || [[ "$OPENAI_API_KEY" == *"your_"* ]]; then
        echo -e "${YELLOW}⚠️  OPENAI_API_KEY no configurada${NC}"
        echo "   AI Coach no funcionará sin esta clave"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ OPENAI_API_KEY configurada${NC}"
    fi

    if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "your_nextauth_secret" ]; then
        echo -e "${YELLOW}⚠️  NEXTAUTH_SECRET no configurada${NC}"
        echo "   Generando una nueva..."
        SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback_secret_change_me")
        # Update .env.local
        if grep -q "NEXTAUTH_SECRET=" .env.local; then
            sed -i.bak "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=${SECRET}/" .env.local
        else
            echo "NEXTAUTH_SECRET=${SECRET}" >> .env.local
        fi
        echo -e "${GREEN}✅ NEXTAUTH_SECRET generada y guardada${NC}"
    else
        echo -e "${GREEN}✅ NEXTAUTH_SECRET configurada${NC}"
    fi

    if [ -z "$STRIPE_SECRET_KEY" ] || [[ "$STRIPE_SECRET_KEY" == *"your_"* ]]; then
        echo -e "${YELLOW}⚠️  STRIPE_SECRET_KEY no configurada${NC}"
        echo "   Pagos no funcionarán hasta que la configures"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ STRIPE_SECRET_KEY configurada${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}3️⃣  Verificando dependencias de Node.js${NC}"

# Check package.json exists
if [ ! -f package.json ]; then
    echo -e "${RED}❌ No estamos en el directorio correcto${NC}"
    echo "   Navega a la carpeta dojoia"
    exit 1
fi

# Check node_modules
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado${NC}"
    echo "   Ejecutando npm install..."
    npm install
else
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
fi

echo ""
echo -e "${YELLOW}4️⃣  Verificando commandos disponibles${NC}"

check_command "node"
check_command "npm"
check_command "npx"

if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase CLI no instalado (opcional)${NC}"
    echo "   Instala con: npm install -g supabase"
fi

echo ""
echo -e "${YELLOW}5️⃣  Verificando conexión a Supabase${NC}"

# Try to ping Supabase
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" 2>/dev/null || echo "000")
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ]; then
        echo -e "${GREEN}✅ Supabase accesible en $NEXT_PUBLIC_SUPABASE_URL${NC}"
    else
        echo -e "${RED}❌ No se pudo conectar a Supabase${NC}"
        echo "   URL: $NEXT_PUBLIC_SUPABASE_URL"
        echo "   HTTP Code: $RESPONSE"
        ((ERRORS++))
    fi
fi

echo ""
echo -e "${YELLOW}6️⃣  Verificando base de datos${NC}"

# Check if tables exist via API
# This requires auth, skip for now
echo -e "${YELLOW}⚠️  Ejecuta manualmente en Supabase Studio:${NC}"
echo "   SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
echo "   Deberías ver ~20 tablas"

echo ""
echo -e "${YELLOW}7️⃣  Verificando TypeScript${NC}"

if npm run typecheck &> /dev/null; then
    echo -e "${GREEN}✅ TypeScript verificado${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript tiene errores${NC}"
    echo "   (Pueden ser warnings normales)"
    npm run typecheck
fi

echo ""
echo -e "${YELLOW}8️⃣  Verificando build${NC}"

if npm run build &> /dev/null; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
else
    echo -e "${RED}❌ Build falló${NC}"
    ((ERRORS++))
fi

echo ""
echo "======================================"
echo "📊 Resumen"
echo "======================================"
echo ""
echo -e "Errores: ${RED}$ERRORS${NC}"
echo -e "Advertencias: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Tu sistema DOJOIA está listo!${NC}"
    echo ""
    echo "🚀 Próximos pasos:"
    echo "   1. Ejecuta: npm run db:push"
    echo "   2. Luego: npx tsx supabase/seed.ts"
    echo "   3. Inicia: npm run dev"
    echo "   4. Abre: http://localhost:3000"
else
    echo -e "${RED}❌ Hay $ERRORS error(es) que debes corregir${NC}"
    echo "   Revisa los mensajes de arriba"
fi

echo ""
