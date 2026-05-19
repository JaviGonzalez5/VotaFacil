export type VoteValue = 'YES' | 'NO' | 'MAYBE'
export type PollType = 'SIMPLE' | 'DATES'

export interface PollOption {
  id: string
  pollId: string
  label: string
  dateTime: string | null
  order: number
}

export interface Participant {
  id: string
  pollId: string
  name: string
  createdAt: string
}

export interface Vote {
  id: string
  pollId: string
  optionId: string
  participantId: string
  value: VoteValue
  createdAt: string
  updatedAt: string
}

export interface Poll {
  id: string
  publicId: string
  adminToken?: string
  title: string
  description: string | null
  type: PollType
  creatorName: string | null
  isClosed: boolean
  createdAt: string
  updatedAt: string
}

export interface PollWithData extends Poll {
  options: PollOption[]
  participants: Participant[]
  votes: Vote[]
}

export interface VoteCounts {
  optionId: string
  yes: number
  no: number
  maybe: number
  total: number
}

export interface CreatePollInput {
  title: string
  description?: string
  type: PollType
  creatorName?: string
  options: { label: string; dateTime?: string }[]
}

export interface SubmitVoteInput {
  name: string
  votes: { optionId: string; value: VoteValue }[]
}
