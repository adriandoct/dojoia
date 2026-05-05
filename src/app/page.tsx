import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, Play, Star, Users, Trophy, Globe, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-dojo-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-white font-bold text-xl font-display">DOJOIA</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
                Cómo funciona
              </a>
              <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">
                Beneficios
              </a>
              <a href="#modules" className="text-gray-300 hover:text-white transition-colors">
                Áreas
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Planes
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
                Testimonios
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-dojo-red hover:bg-dojo-redDark">
                  Prueba gratis
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-dojo-red/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Educación del Futuro con IA</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight animate-slide-up">
              Forma Campeones
              <br />
              <span className="text-dojo-red animate-gradient-x bg-clip-text text-transparent bg-gradient-to-r from-dojo-red to-yellow-500">
                para el Futuro
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto animate-slide-up">
              Plataforma educativa premium que combina karate, inglés, matemáticas,
              programación y más con inteligencia artificial.
              <br />
              <span className="text-dojo-red font-semibold">Disciplina + Conocimiento + Futuro</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link href="/register?plan=student">
                <Button size="xl" className="w-full sm:w-auto text-lg px-10 animate-bounce-slow">
                  <Play className="w-5 h-5" />
                  Prueba gratis 14 días
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="xl" className="w-full sm:w-auto text-lg px-10 border-white text-white hover:bg-white hover:text-gray-900">
                  Ver cómo funciona
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-white text-3xl font-bold">
                  <Users className="w-8 h-8 text-dojo-red" />
                  <span>25K+</span>
                </div>
                <p className="text-gray-400 mt-1">Estudiantes activos</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-white text-3xl font-bold">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <span>1M+</span>
                </div>
                <p className="text-gray-400 mt-1">Lecciones completadas</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-white text-3xl font-bold">
                  <Star className="w-8 h-8 text-green-500" />
                  <span>4.9/5</span>
                </div>
                <p className="text-gray-400 mt-1">Calificación promedio</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-white text-3xl font-bold">
                  <Globe className="w-8 h-8 text-blue-500" />
                  <span>15+</span>
                </div>
                <p className="text-gray-400 mt-1">Países</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-white rotate-90" />
        </div>
      </section>

      {/* Features Section */}
      <section id="benefits" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-dojo-black mb-4">
              El Modelo Kumon Evolucionado
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Combinamos la disciplina y metodología probada de Kumon con IA, gamificación y tecnología moderna
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-dojo-red/10 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-dojo-red" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">IA Personalizada</h3>
              <p className="text-gray-600">
                Nuestro AI Coach adapta el contenido en tiempo real,identifica dificultades y motiva a cada estudiante
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-dojo-red/10 rounded-full flex items-center justify-center mb-6">
                <Trophy className="w-8 h-8 text-dojo-red" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Gamificación Total</h3>
              <p className="text-gray-600">
                DOJICOIN, cintas virtuales, medallas y rankings. Aprender se siente como un videojuego
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-dojo-red/10 rounded-full flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-dojo-red" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aprende en Anywhere</h3>
              <p className="text-gray-600">
                Web y app móvil. Estudia desde cualquier dispositivo, online o offline
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section Preview */}
      <section id="modules" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-dojo-black mb-4">
              Módulos DOJO
            </h2>
            <p className="text-xl text-gray-600">
              10 áreas de formación integral para mentes y cuerpos fuertes
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Math', color: 'bg-blue-500', icon: '🧮' },
              { name: 'English', color: 'bg-green-500', icon: '🗣️' },
              { name: 'Code', color: 'bg-purple-500', icon: '💻' },
              { name: 'Robotics', color: 'bg-orange-500', icon: '🤖' },
              { name: 'Karate', color: 'bg-red-500', icon: '🥋' },
              { name: 'Read', color: 'bg-yellow-500', icon: '📚' },
              { name: 'Write', color: 'bg-pink-500', icon: '✍️' },
              { name: 'AI Coach', color: 'bg-indigo-500', icon: '🤖' },
              { name: 'Leadership', color: 'bg-teal-500', icon: '👑' },
              { name: 'Habits', color: 'bg-cyan-500', icon: '🌱' },
            ].map((module) => (
              <div
                key={module.name}
                className="group relative overflow-hidden rounded-xl bg-gray-50 p-6 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
              >
                <div className={`w-16 h-16 ${module.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {module.icon}
                </div>
                <h3 className="font-bold text-gray-900">{module.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-dojo-red">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            ¿Listo para Empezar?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Únete a miles de familias que ya transformaron la educación de sus hijos
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="xl" variant="secondary" className="w-full sm:w-auto text-lg px-10">
                Inscribir a mi hijo
              </Button>
            </Link>
            <Link href="/register?type=school">
              <Button size="xl" variant="outline" className="w-full sm:w-auto text-lg px-10 border-white text-white hover:bg-white hover:text-dojo-red">
                Soy una escuela
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dojo-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-dojo-red rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <span className="text-white font-bold text-xl font-display">DOJOIA</span>
              </div>
              <p className="text-gray-400">
                Formando campeones para el futuro a través de la disciplina, el conocimiento y la tecnología.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Módulos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Planes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">App móvil</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Escuelas</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 DOJOIA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
