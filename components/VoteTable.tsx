import { Users, X as XIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PollWithData, VoteValue, VoteCounts } from '@/types'

interface VoteTableProps {
  data: PollWithData
  counts: VoteCounts[]
  bestOptionId?: string | null
  /** Admin mode: reassign a participant's vote to another option, or remove them */
  isAdmin?: boolean
  onVoteChange?: (participantId: string, optionId: string, value: VoteValue | null) => void
  onDeleteParticipant?: (participantId: string) => void
}

export function VoteTable({
  data,
  counts,
  bestOptionId,
  isAdmin,
  onVoteChange,
  onDeleteParticipant,
}: VoteTableProps) {
  const { options, participants, votes } = data

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Users className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">Aún no hay votos. ¡Sé el primero!</p>
      </div>
    )
  }

  const getChosenOptionId = (participantId: string): string | undefined =>
    votes.find((v) => v.participantId === participantId)?.optionId

  const totalVotes = participants.length

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const count = counts.find((c) => c.optionId === option.id)
        const total = count?.total ?? 0
        const pct = totalVotes > 0 ? Math.round((total / totalVotes) * 100) : 0
        const voters = participants.filter((p) => getChosenOptionId(p.id) === option.id)
        const isBest = bestOptionId === option.id

        return (
          <div
            key={option.id}
            className={cn(
              'rounded-xl border p-4',
              isBest ? 'border-indigo-200 bg-indigo-50/40' : 'border-gray-200'
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-medium text-gray-900 truncate">{option.label}</span>
                {isBest && total > 0 && <Badge className="shrink-0 text-[10px] px-1 py-0">⭐</Badge>}
              </div>
              <span className="text-sm text-gray-500 shrink-0">
                {total} voto{total !== 1 ? 's' : ''} · {pct}%
              </span>
            </div>

            <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
              <div
                className={cn('h-full rounded-full', isBest ? 'bg-indigo-500' : 'bg-indigo-300')}
                style={{ width: `${pct}%` }}
              />
            </div>

            {voters.length === 0 ? (
              <p className="text-xs text-gray-300">Nadie ha votado esta opción todavía.</p>
            ) : isAdmin ? (
              <div className="space-y-1.5">
                {voters.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-2.5 py-1.5 text-sm"
                  >
                    <span className="flex-1 min-w-0 truncate text-gray-800">{p.name}</span>
                    <select
                      value={option.id}
                      onChange={(e) => onVoteChange?.(p.id, e.target.value, 'YES')}
                      className="text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white text-gray-600 max-w-[40%]"
                      aria-label={`Cambiar opción votada por ${p.name}`}
                    >
                      {options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onDeleteParticipant?.(p.id)}
                      className="text-gray-300 hover:text-red-600 transition-colors shrink-0"
                      title={`Eliminar a ${p.name}`}
                      aria-label={`Eliminar a ${p.name}`}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {voters.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
