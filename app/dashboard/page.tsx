'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  ExternalLink,
  Lock,
  LockOpen,
  Users,
  ArrowLeft,
  LayoutDashboard,
  Loader2,
  PenLine,
  Vote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuthButton } from '@/components/AuthButton'
import { cn } from '@/lib/utils'

interface PollSummary {
  id: string
  publicId: string
  adminToken?: string
  title: string
  description: string | null
  type: string
  isClosed: boolean
  createdAt: string
  _count: { participants: number; options: number }
}

type Tab = 'created' | 'voted'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [created, setCreated] = useState<PollSummary[]>([])
  const [voted, setVoted] = useState<PollSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('created')

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/polls/mine').then((r) => r.json()),
        fetch('/api/polls/voted').then((r) => r.json()),
      ])
        .then(([mine, votedData]) => {
          setCreated(Array.isArray(mine) ? mine : [])
          setVoted(Array.isArray(votedData) ? votedData : [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <LayoutDashboard className="h-12 w-12 text-indigo-400 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Mis votaciones</h2>
            <p className="text-sm text-gray-500">
              Inicia sesión con Google para ver y gestionar todas tus votaciones.
            </p>
            <Button onClick={() => signIn('google')} className="w-full">
              Entrar con Google
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-full text-gray-400">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const polls = tab === 'created' ? created : voted

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              VotaFácil
            </span>
          </div>
          <AuthButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis votaciones</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Hola, {session.user?.name?.split(' ')[0]}
            </p>
          </div>
          <Link href="/create">
            <Button>
              <Plus className="h-4 w-4" />
              Nueva votación
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('created')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === 'created'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <PenLine className="h-4 w-4" />
            Creadas
            <span className={cn(
              'text-xs rounded-full px-2 py-0.5',
              tab === 'created' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
            )}>
              {created.length}
            </span>
          </button>
          <button
            onClick={() => setTab('voted')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === 'voted'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Vote className="h-4 w-4" />
            Votadas
            <span className={cn(
              'text-xs rounded-full px-2 py-0.5',
              tab === 'voted' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
            )}>
              {voted.length}
            </span>
          </button>
        </div>

        {polls.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <div className="text-5xl">{tab === 'created' ? '🗳️' : '🗓️'}</div>
              {tab === 'created' ? (
                <>
                  <p className="font-medium text-gray-700">Aún no has creado ninguna votación</p>
                  <p className="text-sm text-gray-400">
                    Las próximas votaciones que crees con tu cuenta aparecerán aquí.
                  </p>
                  <Link href="/create">
                    <Button className="mt-2">
                      <Plus className="h-4 w-4" />
                      Crear primera votación
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-700">Aún no has votado en ninguna encuesta</p>
                  <p className="text-sm text-gray-400">
                    Cuando votes en una encuesta estando logueado, aparecerá aquí.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {polls.map((poll) => (
              <Card key={poll.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge variant={poll.isClosed ? 'destructive' : 'success'}>
                          {poll.isClosed ? (
                            <><Lock className="h-3 w-3 mr-1" />Cerrada</>
                          ) : (
                            <><LockOpen className="h-3 w-3 mr-1" />Abierta</>
                          )}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {poll._count.participants} voto{poll._count.participants !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="outline">
                          {poll._count.options} opción{poll._count.options !== 1 ? 'es' : ''}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">{poll.title}</h3>
                      {poll.description && (
                        <p className="text-sm text-gray-400 truncate mt-0.5">{poll.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(poll.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link href={`/p/${poll.publicId}`} target="_blank">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-3.5 w-3.5" />
                          {tab === 'voted' ? 'Ver y votar' : 'Ver'}
                        </Button>
                      </Link>
                      {tab === 'created' && poll.adminToken && (
                        <Link href={`/admin/${poll.publicId}?token=${poll.adminToken}`}>
                          <Button size="sm" className="w-full">
                            <Lock className="h-3.5 w-3.5" />
                            Admin
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
