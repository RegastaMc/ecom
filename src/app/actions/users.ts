import { db } from '@/lib/db'

export async function getUsersCount() {
  try {
    const count = await db.user.count({
      where: {
        role: 'USER',
      },
    })
    return count
  } catch (error) {
    console.error('Error fetching users count:', error)
    return 0
  }
}

export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })
    return { success: true, users }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, users: [], error: 'Failed to fetch users' }
  }
}
