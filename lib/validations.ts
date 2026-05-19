import { z } from 'zod'

export const createPollSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(150, 'El título es demasiado largo'),
  description: z.string().max(500, 'La descripción es demasiado larga').optional(),
  type: z.enum(['SIMPLE', 'DATES']),
  creatorName: z.string().max(80).optional(),
  options: z
    .array(
      z.object({
        label: z.string().min(1, 'La opción no puede estar vacía').max(200),
        dateTime: z.string().optional(),
      })
    )
    .min(1, 'Necesitas al menos 1 opción')
    .max(20, 'Máximo 20 opciones'),
})

export const submitVoteSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(80, 'El nombre es demasiado largo')
    .trim(),
  votes: z
    .array(
      z.object({
        optionId: z.string().cuid(),
        value: z.enum(['YES', 'NO', 'MAYBE']),
      })
    )
    .min(1, 'Debes votar al menos una opción'),
})

export const addOptionSchema = z.object({
  label: z.string().min(1, 'La opción no puede estar vacía').max(200),
  dateTime: z.string().optional(),
})

export type CreatePollInput = z.infer<typeof createPollSchema>
export type SubmitVoteInput = z.infer<typeof submitVoteSchema>
export type AddOptionInput = z.infer<typeof addOptionSchema>
