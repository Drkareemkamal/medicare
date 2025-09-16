import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, payroll } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const passwordHash = hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            payroll,
            name,
            dob: new Date(), // Will be updated later
            position: '',
            department: '',
            state: '',
            jobId: '',
            address: '',
            mobile: ''
          }
        }
      },
      include: { profile: true }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
