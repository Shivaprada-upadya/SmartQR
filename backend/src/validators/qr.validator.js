
import { z } from 'zod'

export const createQrSchema = z
  .object({
    title: z.string().trim().min(1).max(150),

    destination: z.string().trim().min(1).max(2048),

    qrType: z.enum(['static', 'dynamic']).default('static'),

    expiresAt: z.iso.datetime().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.qrType === 'dynamic') {
      try {
        const url = new URL(data.destination)

        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol')
        }
      } catch {
        ctx.addIssue({
          code: 'custom',
          path: ['destination'],
          message: 'Dynamic QR codes require a valid HTTP or HTTPS URL',
        })
      }
    }
  })


export const updateQrSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),

    destination: z.string().trim().min(1).max(2048).optional(),

    isActive: z.boolean().optional(),

    expiresAt: z.iso.datetime().nullable().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    {
      message: 'At least one field must be provided',
    },
  )

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})
