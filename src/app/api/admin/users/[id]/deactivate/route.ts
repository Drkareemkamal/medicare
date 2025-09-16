import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function POST(
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

    // Prevent admin from deactivating themselves
    if (params.id === adminUser.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      )
    }

    // Deactivate user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
      include: { profile: true }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorUserId: adminUser.id,
        action: 'USER_DEACTIVATED',
        targetUserId: params.id,
        details: {
          userEmail: updatedUser.email,
          userName: updatedUser.profile?.name
        }
      }
    })

    return NextResponse.json({
      message: 'User deactivated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
