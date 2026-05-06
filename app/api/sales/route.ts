import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Получить все продажи
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const managerId = searchParams.get('managerId')

    const where = managerId ? { managerId } : {}

    const sales = await prisma.sale.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Get sales error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// Создать продажу
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const sale = await prisma.sale.create({
      data: {
        managerId: data.managerId,
        productType: data.productType,
        model: data.model,
        price: parseFloat(data.price),
        clientName: data.clientName || null,
        comment: data.comment || null,
        leadId: data.leadId || null,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Если продажа связана с лидом, обновляем статус лида
    if (data.leadId) {
      await prisma.lead.update({
        where: { id: data.leadId },
        data: { convertedToSale: true },
      })
    }

    return NextResponse.json({
      success: true,
      sale,
    })
  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// Удалить продажу
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

    await prisma.sale.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Продажа удалена',
    })
  } catch (error) {
    console.error('Delete sale error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
