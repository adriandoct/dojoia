#!/bin/bash

# DOJOIA - Quick Setup Script
# Este script configura el proyecto para desarrollo local

set -e

echo "======================================"
echo "🚀 DOJOIA - Configuración Inicial"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}1️⃣  Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Por favor instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version | cut -c 2-)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} encontrado${NC}"

# Check npm
echo -e "${YELLOW}2️⃣  Verificando npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm instalado${NC}"

# Install dependencies
echo -e "${YELLOW}3️⃣  Instalando dependencias...${NC}"
npm install
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# Check .env.local
echo -e "${YELLOW}4️⃣  Verificando variables de entorno...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}⚠️  .env.local no encontrado${NC}"
    echo "Creando desde .env.local.example..."

    if [ -f .env.local.example ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✅ .env.local creado${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
        echo "Por favor, edita .env.local y agrega tus claves API:"
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "  - SUPABASE_SERVICE_ROLE_KEY"
        echo "  - OPENAI_API_KEY"
        echo "  - NEXTAUTH_SECRET (usa: openssl rand -base64 32)"
        echo ""
    else
        echo -e "${RED}❌ .env.local.example no encontrado${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env.local encontrado${NC}"
fi

# Generate NextAuth secret if not set
if ! grep -q "NEXTAUTH_SECRET=your_nextauth_secret\|$(openssl rand -base64 32)" .env.local; then
    echo -e "${YELLOW}Generando NEXTAUTH_SECRET...${NC}"
    SECRET=$(openssl rand -base64 32)
    sed -i.bak "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=${SECRET}/" .env.local
    echo -e "${GREEN}✅ Secret generado${NC}"
fi

# Check Supabase setup
echo -e "${YELLOW}5️⃣  Verificando conexión a Supabase...${NC}"
if grep -q "your_supabase_project_url" .env.local; then
    echo -e "${RED}⚠️  Por favor configura tus credenciales de Supabase${NC}"
    echo "1. Crea cuenta en https://supabase.com"
    echo "2. Crea nuevo proyecto"
    echo "3. Copia URL y anon key a .env.local"
else
    echo -e "${GREEN}✅ Credenciales de Supabase configuradas${NC}"
fi

# Check OpenAI
echo -e "${YELLOW}6️⃣  Verificando OpenAI API...${NC}"
if grep -q "your_openai_api_key" .env.local; then
    echo -e "${YELLOW}⚠️  OpenAI API key no configurada${NC}"
    echo "AI Coach no funcionará sin ella"
else
    echo -e "${GREEN}✅ OpenAI API key configurada${NC}"
fi

# Type check
echo -e "${YELLOW}7️⃣  Verificando TypeScript...${NC}"
npm run typecheck
echo -e "${GREEN}✅ TypeScript OK${NC}"

# Lint
echo -e "${YELLOW}8️⃣  Ejecutando linter...${NC}"
npm run lint 2>/dev/null || echo -e "${YELLOW}⚠️  Algunos warnings (pueden ser ignorados)${NC}"

# Database setup reminder
echo ""
echo "======================================"
echo -e "${GREEN}🎉 ¡Configuración básica completada!${NC}"
echo "======================================"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Configura Supabase:"
echo "   - Ejecuta: npm run db:push"
echo "   - Para crear tablas en Supabase"
echo ""
echo "2. Agrega datos iniciales:"
echo "   - Ejecuta: npx tsx supabase/seed.ts"
echo "   - Esto inserta niveles, módulos y logros"
echo ""
echo "3. Inicia el servidor:"
echo "   - Ejecuta: npm run dev"
echo "   - Visita: http://localhost:3000"
echo ""
echo "4. Accede a Supabase Studio:"
echo "   - Ejecuta: npm run db:studio"
echo ""
echo -e "${YELLOW}📚 Documentación:${NC}"
echo "   - Lee INDEX.md para entender la arquitectura"
echo "   - Revisa SETUP_GUIDE.md para detalles completos"
echo ""
echo "¡Listo para construir DOJOIA! 🥋✨"
echo ""
