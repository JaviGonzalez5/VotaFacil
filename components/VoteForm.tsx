'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { PollWithData } from '@/types'

interface VoteFormProps {
  data: PollWithData
  onVoteSubmitted: () => void
}

export function VoteForm({ data, onVoteSubmitted }: VoteFormProps) {
  const { options, participants, votes } = data
  const [name, setName] = useState('')
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
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
      const existingVote = votes.find((v) => v.participantId === existing.id)
      setSelectedOptionId(existingVote?.optionId ?? null)
    }
  }, [name, participants, votes])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Escribe tu nombre para votar')
      return
    }
    if (!selectedOptionId) {
      setError('Elige una opción antes de guardar')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/polls/${data.publicId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          votes: [{ optionId: selectedOptionId, value: 'YES' }],
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
            setSelectedOptionId(null)
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

      {/* Single choice among options */}
      <div className="space-y-2">
        <Label>Elige tu opción favorita</Label>
        <div className="space-y-2">
          {options.map((option) => {
            const selected = selectedOptionId === option.id
            return (
              <button
                key={option.id}
                type="button"
                data-selected={selected}
                onClick={() => setSelectedOptionId(option.id)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg border py-3 px-4 text-left text-sm font-medium transition-all',
                  'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                  'data-[selected=true]:border-indigo-500 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-700 data-[selected=true]:ring-1 data-[selected=true]:ring-indigo-500'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    selected ? 'border-indigo-500' : 'border-gray-300'
                  )}
                >
                  {selected && <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />}
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !name.trim() || !selectedOptionId}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Guardar voto
          </>
        )}
      </Button>
    </form>
  )
}
