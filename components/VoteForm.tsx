'use client'

import { useState, useEffect, type ElementType, type FormEvent } from 'react'
import { CheckCircle2, XCircle, HelpCircle, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { VoteValue, PollWithData } from '@/types'

interface VoteFormProps {
  data: PollWithData
  onVoteSubmitted: () => void
}

const voteOptions: { value: VoteValue; label: string; icon: ElementType; colors: string }[] = [
  {
    value: 'YES',
    label: 'Sí',
    icon: CheckCircle2,
    colors: 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 data-[selected=true]:border-green-500 data-[selected=true]:bg-green-100 data-[selected=true]:ring-1 data-[selected=true]:ring-green-500',
  },
  {
    value: 'MAYBE',
    label: 'Quizás',
    icon: HelpCircle,
    colors: 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 data-[selected=true]:border-yellow-500 data-[selected=true]:bg-yellow-100 data-[selected=true]:ring-1 data-[selected=true]:ring-yellow-500',
  },
  {
    value: 'NO',
    label: 'No',
    icon: XCircle,
    colors: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 data-[selected=true]:border-red-500 data-[selected=true]:bg-red-100 data-[selected=true]:ring-1 data-[selected=true]:ring-red-500',
  },
]

export function VoteForm({ data, onVoteSubmitted }: VoteFormProps) {
  const { options, participants, votes } = data
  const [name, setName] = useState('')
  const [selections, setSelections] = useState<Record<string, VoteValue>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Pre-fill vote if participant already voted
  useEffect(() => {
    if (!name.trim()) return
    const existing = participants.find(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
    )
    if (existing) {
      const existingVotes: Record<string, VoteValue> = {}
      votes
        .filter((v) => v.participantId === existing.id)
        .forEach((v) => {
          existingVotes[v.optionId] = v.value as VoteValue
        })
      setSelections(existingVotes)
    }
  }, [name, participants, votes])

  const setVote = (optionId: string, value: VoteValue) => {
    setSelections((prev) => ({ ...prev, [optionId]: value }))
  }

  const votedCount = options.filter((o) => selections[o.id]).length

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Escribe tu nombre para votar')
      return
    }
    if (votedCount === 0) {
      setError('Vota al menos una opción antes de guardar')
      return
    }

    // Only send votes for options that have a selection
    const selectedVotes = options
      .filter((o) => selections[o.id])
      .map((o) => ({ optionId: o.id, value: selections[o.id] }))

    setIsLoading(true)
    try {
      const res = await fetch(`/api/polls/${data.publicId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          votes: selectedVotes,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Error al guardar el voto')
      }

      setSuccess(true)
      onVoteSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="font-semibold text-gray-900">¡Voto guardado!</h3>
        <p className="text-sm text-gray-500">Tu voto se ha registrado correctamente.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSuccess(false)
            setSelections({})
            setName('')
          }}
        >
          Votar con otro nombre
        </Button>
      </div>
    )
  }

  const existingParticipant = participants.find(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase()
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="voterName">Tu nombre *</Label>
        <Input
          id="voterName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Ana García"
          maxLength={80}
          required
        />
        {existingParticipant && (
          <p className="text-xs text-indigo-600">
            Actualizando tu voto anterior.
          </p>
        )}
      </div>

      {/* Vote per option */}
      <div className="space-y-3">
        <Label>Vota las opciones que quieras <span className="text-gray-400 font-normal">(al menos 1)</span></Label>
        {options.map((option) => (
          <div key={option.id} className="rounded-lg border border-gray-200 p-3 space-y-2">
            <p className="text-sm font-medium text-gray-800">{option.label}</p>
            <div className="grid grid-cols-3 gap-2">
              {voteOptions.map(({ value, label, icon: Icon, colors }) => (
                <button
                  key={value}
                  type="button"
                  data-selected={selections[option.id] === value}
                  onClick={() => setVote(option.id, value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border py-2.5 px-1 text-xs font-medium transition-all',
                    colors
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !name.trim() || votedCount === 0}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {votedCount > 0 ? `Guardar voto (${votedCount} opción${votedCount !== 1 ? 'es' : ''})` : 'Guardar voto'}
          </>
        )}
      </Button>
    </form>
  )
}
