import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Получить всех пользователей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    const where = role ? { role: role as any } : {}

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        login: true,
        role: true,
        salary: true,
        salesPercent: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
