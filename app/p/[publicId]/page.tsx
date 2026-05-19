'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Calendar,
  ListChecks,
  Lock,
  RefreshCw,
  ArrowLeft,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { VoteTable } from '@/components/VoteTable'
import { VoteForm } from '@/components/VoteForm'
import { CopyButton } from '@/components/CopyButton'
import { AuthButton } from '@/components/AuthButton'
import { computeVoteCounts, getBestOption, getShareUrl } from '@/lib/utils'
import type { PollWithData } from '@/types'

export default function PublicPollPage({
  params,
}: {
  params: { publicId: string }
}) {
  const { publicId } = params

  const [data, setData] = useState<PollWithData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchPoll = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      try {
        const res = await fetch(`/api/polls/${publicId}`)
        if (res.status === 404) {
          setError('Esta votación no existe o ha sido eliminada.')
          return
        }
        if (!res.ok) throw new Error('Error al cargar la votación')
        const json = await res.json()
        setData(json)
        setError(null)
      } catch {
        setError('No se pudo cargar la votación. Inténtalo de nuevo.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [publicId]
  )

  useEffect(() => {
    fetchPoll()
  }, [fetchPoll])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <p className="text-sm">Cargando votación…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">🗳️</div>
          <h1 className="text-xl font-bold text-gray-900">Votación no encontrada</h1>
          <p className="text-gray-500 text-sm">{error}</p>
          <Link href="/">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  const counts = computeVoteCounts(data)
  const best = getBestOption(counts)
  const shareUrl = getShareUrl(publicId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm hidden sm:inline">Inicio</span>
          </Link>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            VotaFácil
          </span>
          <div className="flex items-center gap-2">
            <AuthButton />
            <CopyButton text={shareUrl} label="Compartir" size="sm" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Poll info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div className="flex flex-wrap items-start gap-2">
            <Badge variant={data.isClosed ? 'destructive' : 'success'}>
              {data.isClosed ? (
                <><Lock className="h-3 w-3 mr-1" />Cerrada</>
              ) : (
                'Abierta'
              )}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {data.type === 'DATES' ? (
                <Calendar className="h-3 w-3" />
              ) : (
                <ListChecks className="h-3 w-3" />
              )}
              {data.type === 'DATES' ? 'Fechas' : 'Opciones'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {data.participants.length} voto{data.participants.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
            {data.description && (
              <p className="text-gray-500 text-sm mt-1">{data.description}</p>
            )}
            {data.creatorName && (
              <p className="text-xs text-gray-400 mt-1">Creado por {data.creatorName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Vote form */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {data.isClosed ? (
              <Card>
                <CardContent className="pt-6 text-center py-10 space-y-2">
                  <Lock className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="font-medium text-gray-600">Votación cerrada</p>
                  <p className="text-sm text-gray-400">
                    El administrador ha cerrado esta votación.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tu voto</CardTitle>
                  <CardDescription>
                    Escribe tu nombre y vota cada opción.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VoteForm data={data} onVoteSubmitted={() => fetchPoll(true)} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results table */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Resultados</h2>
              <button
                onClick={() => fetchPoll(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
            <VoteTable
              data={data}
              counts={counts}
              bestOptionId={best?.optionId ?? null}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
