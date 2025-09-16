import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, hashPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all users with their profiles
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        _count: {
          select: {
            documents: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await getUserFromToken(token)
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, password, name, payroll, position, department, mobile, bloodGroup } = await request.json()

    // Validate required fields
    if (!email || !password || !name || !payroll) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Check if payroll number is already used
    const existingProfile = await prisma.employeeProfile.findUnique({
      where: { payroll }
    })

    if (existingProfile) {
      return NextResponse.json({ error: 'Payroll number already exists' }, { status: 400 })
    }

    // Hash password
    const passwordHash = hashPassword(password)

    // Create user and profile
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            payroll,
            name,
            position: position || '',
            department: department || '',
            mobile: mobile || '',
            bloodGroup: bloodGroup || '',
            dob: new Date(), // Will be updated later
            state: '',
            jobId: '',
            address: ''
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorUserId: adminUser.id,
        action: 'USER_CREATED',
        targetUserId: newUser.id,
        details: {
          userEmail: newUser.email,
          userName: newUser.profile?.name
        }
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
