import Link from 'next/link'
import { ArrowRight, CheckCircle2, Link2, Users, Zap, Calendar, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AuthButton } from '@/components/AuthButton'

const features = [
  {
    icon: Zap,
    title: 'Sin registro',
    description: 'Crea una votación en segundos. Nadie necesita crear una cuenta.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
  },
  {
    icon: Link2,
    title: 'Comparte con un enlace',
    description: 'Copia el enlace y mándalo por WhatsApp, Telegram o email.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Vota en grupo',
    description: 'Cada persona escribe su nombre y vota. Sí, No o Quizás.',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    icon: Calendar,
    title: 'Perfecta para quedar',
    description: 'Elige fechas y horarios para pádel, reuniones, o lo que quieras.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: CheckCircle2,
    title: 'Resultados en tiempo real',
    description: 'Ve los votos actualizados al instante. Cierra cuando tengas respuesta.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: Shield,
    title: 'Panel de administración',
    description: 'Enlace secreto para gestionar tu votación sin que nadie más pueda.',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
]

const useCases = [
  '🎾 Organizar partidos de pádel',
  '🍽️ Elegir restaurante para una cena',
  '📅 Buscar hueco para una reunión',
  '🏖️ Planificar vacaciones en grupo',
  '🎉 Votar el plan del finde',
  '🏆 Decidir el mejor horario para el equipo',
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            VotaFácil
          </span>
          <div className="flex items-center gap-2">
            <AuthButton />
            <Link href="/create" className="hidden sm:block">
              <Button size="sm">Crear votación</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Zap className="h-4 w-4" />
            Gratis · Sin registro · Instantáneo
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Votaciones rápidas para{' '}
            <span className="underline decoration-yellow-300 decoration-4 underline-offset-4">
              grupos
            </span>
          </h1>
          <p className="text-xl text-white/85 max-w-xl mx-auto leading-relaxed">
            Crea una votación en 30 segundos, comparte el enlace y recoge las respuestas de todo el grupo. Sin cuentas, sin complicaciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/create" className="w-full sm:w-auto">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 font-semibold shadow-lg w-full">
                Crear votación gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Así de fácil
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Crea la votación', desc: 'Escribe el título y añade las opciones o fechas.' },
              { step: '2', title: 'Comparte el enlace', desc: 'Copia el enlace y mándalo al grupo por donde quieras.' },
              { step: '3', title: 'Recoge los votos', desc: 'Cada persona vota sin registrarse. Tú ves los resultados.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white text-xl font-bold flex items-center justify-center shadow-md">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Todo lo que necesitas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <Card key={title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">¿Para qué lo usan?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {useCases.map((uc) => (
              <div
                key={uc}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
              >
                {uc}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16 px-4 text-center text-white">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">¿Listo para organizar tu grupo?</h2>
          <p className="text-white/80">Crea tu primera votación en menos de un minuto.</p>
          <Link href="/create">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 font-semibold shadow-lg mt-2">
              Empezar ahora — es gratis
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 px-4 text-center text-sm">
        <p>VotaFácil · Votaciones sin registro · Hecho con ❤️</p>
      </footer>
    </div>
  )
}
