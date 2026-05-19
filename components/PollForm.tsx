'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Calendar, ListChecks, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type PollType = 'SIMPLE' | 'DATES'

interface OptionRow {
  id: string
  label: string
  dateTime: string
}

export function PollForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<PollType>('SIMPLE')
  const [creatorName, setCreatorName] = useState('')
  const [options, setOptions] = useState<OptionRow[]>([
    { id: crypto.randomUUID(), label: '', dateTime: '' },
  ])

  const addOption = () => {
    if (options.length >= 20) return
    setOptions((prev) => [...prev, { id: crypto.randomUUID(), label: '', dateTime: '' }])
  }

  const removeOption = (id: string) => {
    if (options.length <= 1) return
    setOptions((prev) => prev.filter((o) => o.id !== id))
  }

  const updateOption = (id: string, field: 'label' | 'dateTime', value: string) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const filledOptions = options.filter((o) => o.label.trim() !== '')
    if (filledOptions.length < 2) {
      setError('Necesitas al menos 2 opciones')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          creatorName: creatorName.trim() || undefined,
          options: filledOptions.map((o) => ({
            label: o.label.trim(),
            dateTime: o.dateTime || undefined,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear la votación')
      }

      const data = await res.json()
      router.push(`/create/success?publicId=${data.publicId}&token=${data.adminToken}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de votación */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setType('SIMPLE')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all',
            type === 'SIMPLE'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          )}
        >
          <ListChecks className="h-6 w-6" />
          Opciones simples
        </button>
        <button
          type="button"
          onClick={() => setType('DATES')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all',
            type === 'DATES'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          )}
        >
          <Calendar className="h-6 w-6" />
          Fechas y horarios
        </button>
      </div>

      {/* Título */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Título de la votación *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            type === 'DATES'
              ? 'Ej: ¿Cuándo jugamos al pádel?'
              : 'Ej: ¿Dónde celebramos la cena?'
          }
          required
          maxLength={150}
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Añade más contexto para los participantes…"
          maxLength={500}
          rows={2}
        />
      </div>

      {/* Nombre del creador */}
      <div className="space-y-1.5">
        <Label htmlFor="creatorName">Tu nombre (opcional)</Label>
        <Input
          id="creatorName"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="Ej: Carlos"
          maxLength={80}
        />
      </div>

      {/* Opciones */}
      <div className="space-y-3">
        <Label>
          {type === 'DATES' ? 'Fechas y horarios *' : 'Opciones *'}
        </Label>

        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <span className="w-5 text-center text-sm text-gray-400 shrink-0">
                {index + 1}
              </span>
              <Input
                value={option.label}
                onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                placeholder={
                  type === 'DATES'
                    ? 'Ej: Lunes 26 mayo — 19:00'
                    : 'Ej: Restaurante italiano'
                }
                maxLength={200}
                className="flex-1"
              />
              {type === 'DATES' && (
                <Input
                  type="datetime-local"
                  value={option.dateTime}
                  onChange={(e) => updateOption(option.id, 'dateTime', e.target.value)}
                  className="w-44 shrink-0 text-xs"
                />
              )}
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                disabled={options.length <= 2}
                className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          disabled={options.length >= 20}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4" />
          Añadir opción
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creando votación…
          </>
        ) : (
          'Crear votación'
        )}
      </Button>
    </form>
  )
}
