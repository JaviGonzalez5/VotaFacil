'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Settings,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VoteTable } from '@/components/VoteTable'
import { AdminPanel } from '@/components/AdminPanel'
import { computeVoteCounts } from '@/lib/utils'
import type { PollWithData, VoteValue } from '@/types'

function AdminContent({ publicId }: { publicId: string }) {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [data, setData] = useState<PollWithData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [voteActionError, setVoteActionError] = useState<string | null>(null)

  const fetchPoll = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      try {
        const res = await fetch(`/api/polls/${publicId}`)
        if (res.status === 404) {
          setError('Esta votación no existe.')
          return
        }
        if (!res.ok) throw new Error()
        const json = await res.json()

        // Validate token client-side by checking a dummy PATCH
        // We just store the token and validate it on actions
        setData(json)
        setError(null)
      } catch {
        setError('No se pudo cargar la votación.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [publicId]
  )

  useEffect(() => {
    if (!token) {
      setAuthError(true)
      setLoading(false)
      return
    }
    fetchPoll()
  }, [fetchPoll, token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <p className="text-sm">Cargando panel…</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="max-w-sm w-full border-red-200">
          <CardContent className="pt-8 pb-8 text-center space-y-3">
            <ShieldAlert className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="font-bold text-gray-900">Acceso denegado</h2>
            <p className="text-sm text-gray-500">
              Necesitas el enlace de administración con el token correcto para acceder a esta página.
            </p>
            <Link href="/">
              <Button variant="outline" size="sm">Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4">
          <p className="text-gray-500">{error || 'Votación no encontrada'}</p>
          <Link href="/"><Button variant="outline">Volver</Button></Link>
        </div>
      </div>
    )
  }

  const counts = computeVoteCounts(data)

  const handleVoteChange = async (
    participantId: string,
    optionId: string,
    value: VoteValue | null
  ) => {
    try {
      const res = await fetch(`/api/polls/${publicId}/vote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId, optionId, value }),
      })
      if (!res.ok) throw new Error()
      setVoteActionError(null)
      fetchPoll(true)
    } catch {
      setVoteActionError('No se pudo actualizar el voto.')
    }
  }

  const handleDeleteParticipant = async (participantId: string) => {
    const participant = data.participants.find((p) => p.id === participantId)
    if (!confirm(`¿Eliminar a "${participant?.name ?? 'este participante'}" y todos sus votos?`)) return
    try {
      const res = await fetch(`/api/polls/${publicId}/participants/${participantId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      setVoteActionError(null)
      fetchPoll(true)
    } catch {
      setVoteActionError('No se pudo eliminar el participante.')
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Poll header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Administración
          </Badge>
          <Badge variant={data.isClosed ? 'destructive' : 'success'}>
            {data.isClosed ? 'Cerrada' : 'Abierta'}
          </Badge>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
            {data.description && (
              <p className="text-gray-500 text-sm mt-1">{data.description}</p>
            )}
          </div>
          <Link href={`/p/${publicId}`} target="_blank" className="shrink-0">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Ver votación</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Admin panel */}
        <div className="lg:col-span-1">
          <AdminPanel
            data={data}
            adminToken={token}
            counts={counts}
            onUpdate={() => fetchPoll(true)}
          />
        </div>

        {/* Vote table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Votos ({data.participants.length} participante{data.participants.length !== 1 ? 's' : ''})
            </h2>
            <button
              onClick={() => fetchPoll(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
          {voteActionError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{voteActionError}</p>
          )}
          <p className="text-xs text-gray-400">
            Clic en una celda para cambiar un voto, o en la ✕ para eliminar a un participante.
          </p>
          <VoteTable
            data={data}
            counts={counts}
            isAdmin
            onVoteChange={handleVoteChange}
            onDeleteParticipant={handleDeleteParticipant}
          />
        </div>
      </div>
    </main>
  )
}

export default function AdminPage({
  params,
}: {
  params: { publicId: string }
}) {
  const { publicId } = params

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            VotaFácil
          </span>
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 font-medium ml-1">
            Admin
          </span>
        </div>
      </header>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      }>
        <AdminContent publicId={publicId} />
      </Suspense>
    </div>
  )
}
