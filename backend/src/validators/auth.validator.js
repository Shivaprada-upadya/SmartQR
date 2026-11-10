import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),

  email: z.string().trim().email().max(255),

  password: z.string().min(8).max(72),
})