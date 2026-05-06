import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Получить посещаемость пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      )
    }

    const attendances = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    })

    return NextResponse.json(attendances)
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// Отметить приход или уход
export async function POST(request: NextRequest) {
  try {
    const { userId, type } = await request.json()

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId и type обязательны' },
        { status: 400 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Проверяем, есть ли уже запись на сегодня
    let attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    })

    const now = new Date()

    if (type === 'arrival') {
      if (attendance?.arrivalTime) {
        return NextResponse.json(
          { error: 'Вы уже отметили приход сегодня' },
          { status: 400 }
        )
      }

      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0)

      attendance = await prisma.attendance.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {
          arrivalTime: now,
          status: isLate ? 'LATE' : 'PRESENT',
        },
        create: {
          userId,
          date: today,
          arrivalTime: now,
          status: isLate ? 'LATE' : 'PRESENT',
        },
      })

      return NextResponse.json({
        success: true,
        message: isLate ? 'Приход отмечен (опоздание)' : 'Приход отмечен',
        attendance,
      })
    } else if (type === 'departure') {
      if (!attendance?.arrivalTime) {
        return NextResponse.json(
          { error: 'Сначала отметьте приход' },
          { status: 400 }
        )
      }

      if (attendance.departureTime) {
        return NextResponse.json(
          { error: 'Вы уже отметили уход сегодня' },
          { status: 400 }
        )
      }

      const hoursWorked = (now.getTime() - attendance.arrivalTime.getTime()) / (1000 * 60 * 60)

      attendance = await prisma.attendance.update({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        data: {
          departureTime: now,
          hoursWorked: Math.round(hoursWorked * 100) / 100,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Уход отмечен',
        attendance,
      })
    }

    return NextResponse.json(
      { error: 'Неверный тип действия' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Mark attendance error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
