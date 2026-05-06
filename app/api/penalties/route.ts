import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Получить штрафы и бонусы
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where = userId ? { userId } : {}

    const penalties = await prisma.penaltyBonus.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(penalties)
  } catch (error) {
    console.error('Get penalties error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// Создать штраф или бонус
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const penalty = await prisma.penaltyBonus.create({
      data: {
        userId: data.userId,
        type: data.type,
        amount: parseFloat(data.amount),
        reason: data.reason,
        createdBy: data.createdBy,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      penalty,
    })
  } catch (error) {
    console.error('Create penalty error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// Удалить штраф или бонус
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id обязателен' },
        { status: 400 }
      )
    }

    await prisma.penaltyBonus.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Запись удалена',
    })
  } catch (error) {
    console.error('Delete penalty error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
