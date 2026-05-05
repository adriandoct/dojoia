# DOJOIA - Plataforma Educativa Premium

## Estructura del Proyecto

```
dojoia/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard specific
│   └── modules/          # DOJO modules
├── lib/                  # Utilities & configurations
│   ├── supabase/         # DB client & types
│   ├── auth/             # Auth helpers
│   └── utils/            # General utilities
├── styles/               # Global styles
├── types/                # TypeScript definitions
└── public/               # Static assets
```

## Stack Tecnológico
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Supabase (DB + Auth + Storage)
- **IA**: OpenAI API (GPT-4 + Whisper)
- **Payments**: Stripe + MercadoPago
- **Hosting**: Vercel
- **Mobile**: React Native (future expansion)

## Características Clave
- Sistema de niveles progresivos (White → Black)
- Gamificación con DOJICOIN
- AI Coach personal 24/7
- Panel para padres y maestros
- Módulos especializados (Math, English, Code, Robotics, Karate)
- Real-time tracking y reportes