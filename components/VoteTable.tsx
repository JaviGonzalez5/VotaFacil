import type { ElementType } from 'react'
import { CheckCircle2, XCircle, HelpCircle, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PollWithData, VoteValue, VoteCounts } from '@/types'

interface VoteTableProps {
  data: PollWithData
  counts: VoteCounts[]
  bestOptionId?: string | null
}

const voteConfig: Record<VoteValue, { icon: ElementType; label: string; cell: string; badge: string }> = {
  YES: {
    icon: CheckCircle2,
    label: 'Sí',
    cell: 'bg-green-50 text-green-700',
    badge: 'bg-green-100 text-green-800',
  },
  NO: {
    icon: XCircle,
    label: 'No',
    cell: 'bg-red-50 text-red-700',
    badge: 'bg-red-100 text-red-800',
  },
  MAYBE: {
    icon: HelpCircle,
    label: 'Quizás',
    cell: 'bg-yellow-50 text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800',
  },
}

function VoteCell({ value }: { value: VoteValue | undefined }) {
  if (!value) {
    return (
      <td className="px-2 py-3 text-center w-16">
        <span className="text-gray-200 text-lg">—</span>
      </td>
    )
  }
  const config = voteConfig[value]
  const Icon = config.icon
  return (
    <td className={cn('px-2 py-3 text-center w-16', config.cell)}>
      <Icon className="h-5 w-5 mx-auto" strokeWidth={2.5} />
    </td>
  )
}

export function VoteTable({ data, counts, bestOptionId }: VoteTableProps) {
  const { options, participants, votes } = data

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Users className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">Aún no hay votos. ¡Sé el primero!</p>
      </div>
    )
  }

  const getVote = (participantId: string, optionId: string): VoteValue | undefined => {
    const vote = votes.find(
      (v) => v.participantId === participantId && v.optionId === optionId
    )
    return vote?.value as VoteValue | undefined
  }

  const countForOption = (optionId: string) =>
    counts.find((c) => c.optionId === optionId)

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse" style={{ minWidth: '100%' }}>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left font-semibold text-gray-700 z-10 min-w-[90px] max-w-[130px]">
                Nombre
              </th>
              {options.map((option) => (
                <th
                  key={option.id}
                  className={cn(
                    'px-2 py-3 text-center font-medium text-gray-700 w-16',
                    bestOptionId === option.id && 'bg-indigo-50'
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs leading-tight line-clamp-2 max-w-[80px]">{option.label}</span>
                    {bestOptionId === option.id && (
                      <Badge className="text-[10px] px-1 py-0">⭐</Badge>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, idx) => (
              <tr
                key={participant.id}
                className={cn(
                  'border-b border-gray-100 transition-colors hover:bg-gray-50',
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                )}
              >
                <td className="sticky left-0 bg-inherit px-3 py-3 font-medium text-gray-900 z-10 max-w-[130px] truncate">
                  {participant.name}
                </td>
                {options.map((option) => (
                  <VoteCell
                    key={option.id}
                    value={getVote(participant.id, option.id)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td className="sticky left-0 bg-gray-50 px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide z-10">
                Total
              </td>
              {options.map((option) => {
                const c = countForOption(option.id)
                return (
                  <td key={option.id} className={cn('px-2 py-3', bestOptionId === option.id && 'bg-indigo-50/60')}>
                    <div className="flex flex-col items-center gap-0.5 text-xs">
                      {c && (
                        <>
                          <span className="font-semibold text-green-700 flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" />{c.yes}
                          </span>
                          <span className="text-yellow-700 flex items-center gap-0.5">
                            <HelpCircle className="h-3 w-3" />{c.maybe}
                          </span>
                          <span className="text-red-700 flex items-center gap-0.5">
                            <XCircle className="h-3 w-3" />{c.no}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
