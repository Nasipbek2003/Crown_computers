import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Получить все лиды
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operatorId = searchParams.get('operatorId')

    const where = operatorId ? { operatorId } : {}

    const leads = await prisma.lead.findMany({
      where,
      include: {
        operator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// Создать лид
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const lead = await prisma.lead.create({
      data: {
        operatorId: data.operatorId,
        clientName: data.clientName,
        phone: data.phone,
        interest: data.interest,
        status: data.status,
        managerId: data.managerId || null,
        comment: data.comment || null,
      },
      include: {
        operator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      lead,
    })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// Обновить лид
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: 'id обязателен' },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        operator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      lead,
    })
  } catch (error) {
    console.error('Update lead error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
