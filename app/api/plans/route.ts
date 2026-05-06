import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Получить план на текущий месяц
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const plan = await prisma.salesPlan.findUnique({
      where: { month },
    })

    if (!plan) {
      return NextResponse.json({
        month,
        laptopTarget: 0,
        computerTarget: 0,
        totalAmountTarget: 0,
      })
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Get plan error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// Создать или обновить план
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const plan = await prisma.salesPlan.upsert({
      where: { month: data.month },
      update: {
        laptopTarget: data.laptopTarget ? parseInt(data.laptopTarget) : null,
        computerTarget: data.computerTarget ? parseInt(data.computerTarget) : null,
        totalAmountTarget: data.totalAmountTarget ? parseFloat(data.totalAmountTarget) : null,
      },
      create: {
        month: data.month,
        laptopTarget: data.laptopTarget ? parseInt(data.laptopTarget) : null,
        computerTarget: data.computerTarget ? parseInt(data.computerTarget) : null,
        totalAmountTarget: data.totalAmountTarget ? parseFloat(data.totalAmountTarget) : null,
      },
    })

    return NextResponse.json({
      success: true,
      plan,
    })
  } catch (error) {
    console.error('Create/update plan error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
