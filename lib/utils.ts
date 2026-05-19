import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { randomBytes } from 'crypto'
import type { PollWithData, VoteCounts, VoteValue } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePublicId(): string {
  return randomBytes(4).toString('hex')
}

export function generateAdminToken(): string {
  return randomBytes(16).toString('hex')
}

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export function getShareUrl(publicId: string): string {
  return `${getBaseUrl()}/p/${publicId}`
}

export function getAdminUrl(publicId: string, adminToken: string): string {
  return `${getBaseUrl()}/admin/${publicId}?token=${adminToken}`
}

export function computeVoteCounts(data: PollWithData): VoteCounts[] {
  return data.options.map((option) => {
    const optionVotes = data.votes.filter((v) => v.optionId === option.id)
    return {
      optionId: option.id,
      yes: optionVotes.filter((v) => v.value === 'YES').length,
      no: optionVotes.filter((v) => v.value === 'NO').length,
      maybe: optionVotes.filter((v) => v.value === 'MAYBE').length,
      total: optionVotes.length,
    }
  })
}

export function getBestOption(
  counts: VoteCounts[]
): VoteCounts | null {
  if (counts.length === 0) return null
  return counts.reduce((best, curr) => {
    if (curr.yes > best.yes) return curr
    if (curr.yes === best.yes && curr.no < best.no) return curr
    return best
  })
}

export function voteValueLabel(value: VoteValue): string {
  const labels: Record<VoteValue, string> = {
    YES: 'Sí',
    NO: 'No',
    MAYBE: 'Quizás',
  }
  return labels[value]
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
