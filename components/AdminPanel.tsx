'use client'

import { useState, type FormEvent } from 'react'
import {
  Lock,
  LockOpen,
  Trash2,
  Plus,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/CopyButton'
import { getShareUrl, getBestOption } from '@/lib/utils'
import type { PollWithData, VoteCounts } from '@/types'

interface AdminPanelProps {
  data: PollWithData
  adminToken: string
  counts: VoteCounts[]
  onUpdate: () => void
}

export function AdminPanel({ data, adminToken, counts, onUpdate }: AdminPanelProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newOption, setNewOption] = useState('')
  const [isAddingOption, setIsAddingOption] = useState(false)
  const [optionError, setOptionError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const shareUrl = getShareUrl(data.publicId)
  const best = getBestOption(counts)
  const bestOption = data.options.find((o) => o.id === best?.optionId)

  const handleToggleClose = async () => {
    setIsClosing(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/polls/${data.publicId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ action: data.isClosed ? 'reopen' : 'close' }),
      })
      if (!res.ok) throw new Error('Error al actualizar la votación')
      onUpdate()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsClosing(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/polls/${data.publicId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      if (!res.ok) throw new Error('Error al eliminar la votación')
      window.location.href = '/'
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error inesperado')
      setIsDeleting(false)
    }
  }

  const handleAddOption = async (e: FormEvent) => {
    e.preventDefault()
    if (!newOption.trim()) return
    setIsAddingOption(true)
    setOptionError(null)
    try {
      const res = await fetch(`/api/polls/${data.publicId}/options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ label: newOption.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Error al añadir opción')
      }
      setNewOption('')
      onUpdate()
    } catch (err) {
      setOptionError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsAddingOption(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status & Share */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estado y enlace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={data.isClosed ? 'destructive' : 'success'}>
              {data.isClosed ? 'Cerrada' : 'Abierta'}
            </Badge>
            <span className="text-sm text-gray-500">
              {data.participants.length} participante
              {data.participants.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="flex-1 truncate text-xs text-gray-600">{shareUrl}</span>
            <CopyButton text={shareUrl} label="Copiar" size="sm" />
          </div>
        </CardContent>
      </Card>

      {/* Best option */}
      {bestOption && counts.some((c) => c.yes > 0) && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-4">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
              ⭐ Mejor opción
            </p>
            <p className="font-semibold text-gray-900">{bestOption.label}</p>
            <p className="text-sm text-gray-600 mt-1">
              {best?.yes} Sí · {best?.maybe} Quizás · {best?.no} No
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results sorted */}
      {counts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ranking de opciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...counts]
                .sort((a, b) => b.yes - a.yes || a.no - b.no || b.maybe - a.maybe)
                .map((c, idx) => {
                  const opt = data.options.find((o) => o.id === c.optionId)
                  if (!opt) return null
                  return (
                    <div key={c.optionId} className="flex items-center gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-gray-800">{opt.label}</span>
                      <span className="text-green-600 font-semibold">✓{c.yes}</span>
                      <span className="text-yellow-600">?{c.maybe}</span>
                      <span className="text-red-500">✗{c.no}</span>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add option */}
      {!data.isClosed && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Añadir opción</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOption} className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Nueva opción…"
                maxLength={200}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={isAddingOption || !newOption.trim()}>
                {isAddingOption ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </form>
            {optionError && (
              <p className="mt-2 text-xs text-red-600">{optionError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actionError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {actionError}
            </p>
          )}

          <Button
            variant={data.isClosed ? 'success' : 'secondary'}
            className="w-full"
            onClick={handleToggleClose}
            disabled={isClosing}
          >
            {isClosing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : data.isClosed ? (
              <LockOpen className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {data.isClosed ? 'Reabrir votación' : 'Cerrar votación'}
          </Button>

          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar votación
            </Button>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Esta acción no se puede deshacer. ¿Seguro?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sí, eliminar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
