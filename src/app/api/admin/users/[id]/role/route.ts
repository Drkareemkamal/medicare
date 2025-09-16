import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { role } = await request.json()

    if (!['EMPLOYEE', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Prevent admin from demoting themselves
    if (params.id === adminUser.id && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      include: { profile: true }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorUserId: adminUser.id,
        action: 'ROLE_CHANGE',
        targetUserId: params.id,
        details: {
          oldRole: updatedUser.role,
          newRole: role
        }
      }
    })

    return NextResponse.json({
      message: 'Role updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
