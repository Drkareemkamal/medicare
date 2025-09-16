import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  payroll: z.string().min(1)
})

export const employeeProfileSchema = z.object({
  payroll: z.string().min(1),
  name: z.string().min(1),
  dob: z.string().transform(str => new Date(str)),
  position: z.string().min(1),
  department: z.string().min(1),
  state: z.string().min(1),
  jobId: z.string().min(1),
  bloodGroup: z.string().optional(),
  specialHabit: z.string().optional(),
  note: z.string().optional(),
  chronicDisease: z.string().optional(),
  address: z.string().min(1),
  mobile: z.string().min(1)
})

export const documentUploadSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['LAB', 'SCAN', 'OTHER'])
})
