import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    // Получаем текущий месяц
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    let statistics: any = {}

    // Статистика продаж
    if (role === 'MANAGER' || role === 'ROP' || role === 'OWNER') {
      const salesWhere = role === 'MANAGER' && userId ? { managerId: userId } : {}
      
      const sales = await prisma.sale.findMany({
        where: {
          ...salesWhere,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      })

      const totalSales = sales.length
      const totalAmount = sales.reduce((sum, sale) => sum + sale.price, 0)
      const averageCheck = totalSales > 0 ? totalAmount / totalSales : 0

      statistics.sales = {
        totalSales,
        totalAmount,
        averageCheck,
        laptops: sales.filter(s => s.productType === 'LAPTOP').length,
        computers: sales.filter(s => s.productType === 'COMPUTER').length,
      }
    }

    // Статистика лидов
    if (role === 'OPERATOR' || role === 'ROP' || role === 'OWNER') {
      const leadsWhere = role === 'OPERATOR' && userId ? { operatorId: userId } : {}
      
      const leads = await prisma.lead.findMany({
        where: {
          ...leadsWhere,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      })

      const totalLeads = leads.length
      const transferredLeads = leads.filter(l => l.status === 'TRANSFERRED').length
      const convertedLeads = leads.filter(l => l.convertedToSale).length
      const conversionRate = transferredLeads > 0 ? (convertedLeads / transferredLeads) * 100 : 0

      statistics.leads = {
        totalLeads,
        transferredLeads,
        convertedLeads,
        conversionRate: Math.round(conversionRate),
      }
    }

    // Статистика посещаемости
    if (userId) {
      const attendances = await prisma.attendance.findMany({
        where: {
          userId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      })

      const totalDays = attendances.length
      const presentDays = attendances.filter(a => a.status === 'PRESENT').length
      const lateDays = attendances.filter(a => a.status === 'LATE').length
      const absentDays = attendances.filter(a => a.status === 'ABSENT').length
      const totalHours = attendances.reduce((sum, a) => sum + (a.hoursWorked || 0), 0)

      statistics.attendance = {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        totalHours: Math.round(totalHours * 100) / 100,
      }
    }

    // Расчёт зарплаты
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (user) {
        let salary = user.salary

        // Добавляем процент от продаж для менеджеров
        if (user.role === 'MANAGER' && user.salesPercent) {
          const sales = await prisma.sale.findMany({
            where: {
              managerId: userId,
              createdAt: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
          })

          const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.price, 0)
          salary += (totalSalesAmount * user.salesPercent) / 100
        }

        // Добавляем бонусы и вычитаем штрафы
        const penaltiesBonuses = await prisma.penaltyBonus.findMany({
          where: {
            userId,
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        })

        const bonuses = penaltiesBonuses
          .filter(pb => pb.type === 'BONUS')
          .reduce((sum, pb) => sum + pb.amount, 0)

        const penalties = penaltiesBonuses
          .filter(pb => pb.type === 'PENALTY')
          .reduce((sum, pb) => sum + pb.amount, 0)

        salary = salary + bonuses - penalties

        statistics.salary = {
          baseSalary: user.salary,
          bonuses,
          penalties,
          totalSalary: Math.round(salary),
        }
      }
    }

    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Get statistics error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
