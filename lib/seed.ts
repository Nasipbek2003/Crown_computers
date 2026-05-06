import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Очистка базы данных
  await prisma.achievement.deleteMany()
  await prisma.penaltyBonus.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.salesPlan.deleteMany()
  await prisma.user.deleteMany()

  // Хешируем пароли
  const hashedPassword = await bcrypt.hash('123456', 10)

  // Создаём пользователей
  const owner = await prisma.user.create({
    data: {
      name: 'Владимир Королёв',
      login: 'owner',
      password: hashedPassword,
      role: 'OWNER',
      salary: 0,
    },
  })

  const rop = await prisma.user.create({
    data: {
      name: 'Сергей Петров',
      login: 'rop',
      password: hashedPassword,
      role: 'ROP',
      salary: 8000000,
    },
  })

  const manager1 = await prisma.user.create({
    data: {
      name: 'Иван Петров',
      login: 'manager1',
      password: hashedPassword,
      role: 'MANAGER',
      salary: 5000000,
      salesPercent: 3,
    },
  })

  const manager2 = await prisma.user.create({
    data: {
      name: 'Мария Смирнова',
      login: 'manager2',
      password: hashedPassword,
      role: 'MANAGER',
      salary: 5000000,
      salesPercent: 3,
    },
  })

  const operator1 = await prisma.user.create({
    data: {
      name: 'Алексей Козлов',
      login: 'operator1',
      password: hashedPassword,
      role: 'OPERATOR',
      salary: 3000000,
    },
  })

  const operator2 = await prisma.user.create({
    data: {
      name: 'Анна Волкова',
      login: 'operator2',
      password: hashedPassword,
      role: 'OPERATOR',
      salary: 3000000,
    },
  })

  const operator3 = await prisma.user.create({
    data: {
      name: 'Дмитрий Соколов',
      login: 'operator3',
      password: hashedPassword,
      role: 'OPERATOR',
      salary: 3000000,
    },
  })

  const operator4 = await prisma.user.create({
    data: {
      name: 'Елена Морозова',
      login: 'operator4',
      password: hashedPassword,
      role: 'OPERATOR',
      salary: 3000000,
    },
  })

  console.log('✅ Пользователи созданы')

  // Создаём план продаж на май 2026
  await prisma.salesPlan.create({
    data: {
      month: '2026-05',
      laptopTarget: 25,
      computerTarget: 15,
      totalAmountTarget: 600000000,
    },
  })

  console.log('✅ План продаж создан')

  // Создаём продажи
  const salesData = [
    { managerId: manager1.id, productType: 'LAPTOP', model: 'MacBook Pro 14', price: 25000000, clientName: 'Алексей Иванов' },
    { managerId: manager1.id, productType: 'LAPTOP', model: 'Dell XPS 15', price: 18500000, clientName: 'Ольга Петрова' },
    { managerId: manager1.id, productType: 'LAPTOP', model: 'Lenovo Legion 5', price: 15000000, clientName: 'Игорь Сидоров' },
    { managerId: manager2.id, productType: 'COMPUTER', model: 'Gaming PC RTX 4080', price: 32000000, clientName: 'Дмитрий Сидоров' },
    { managerId: manager2.id, productType: 'LAPTOP', model: 'HP Pavilion', price: 12000000, clientName: 'Светлана Кузнецова' },
    { managerId: manager2.id, productType: 'COMPUTER', model: 'Office PC i5', price: 8000000, clientName: 'Андрей Новиков' },
  ]

  for (const sale of salesData) {
    await prisma.sale.create({ data: sale as any })
  }

  console.log('✅ Продажи созданы')

  // Создаём лиды
  const leadsData = [
    { operatorId: operator1.id, clientName: 'Максим Орлов', phone: '+998901234567', interest: 'LAPTOP', status: 'WARM' },
    { operatorId: operator1.id, clientName: 'Наталья Белова', phone: '+998901234568', interest: 'COMPUTER', status: 'TRANSFERRED', managerId: manager1.id },
    { operatorId: operator2.id, clientName: 'Виктор Зайцев', phone: '+998901234569', interest: 'LAPTOP', status: 'COLD' },
    { operatorId: operator2.id, clientName: 'Татьяна Лебедева', phone: '+998901234570', interest: 'UNDEFINED', status: 'WARM' },
    { operatorId: operator3.id, clientName: 'Павел Медведев', phone: '+998901234571', interest: 'COMPUTER', status: 'TRANSFERRED', managerId: manager2.id },
  ]

  for (const lead of leadsData) {
    await prisma.lead.create({ data: lead as any })
  }

  console.log('✅ Лиды созданы')

  // Создаём посещаемость за последние 7 дней
  const today = new Date('2026-05-06')
  const users = [owner, rop, manager1, manager2, operator1, operator2, operator3, operator4]

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Пропускаем выходные
    if (date.getDay() === 0 || date.getDay() === 6) continue

    for (const user of users) {
      const isLate = Math.random() > 0.8
      const isAbsent = Math.random() > 0.95
      
      if (isAbsent) {
        await prisma.attendance.create({
          data: {
            userId: user.id,
            date: date,
            status: 'ABSENT',
          },
        })
      } else {
        const arrivalHour = isLate ? 9 : 8
        const arrivalMinute = isLate ? Math.floor(Math.random() * 30) + 5 : Math.floor(Math.random() * 60)
        const arrivalTime = new Date(date)
        arrivalTime.setHours(arrivalHour, arrivalMinute, 0)

        const departureTime = new Date(date)
        departureTime.setHours(18, Math.floor(Math.random() * 15), 0)

        const hoursWorked = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60 * 60)

        await prisma.attendance.create({
          data: {
            userId: user.id,
            date: date,
            arrivalTime: arrivalTime,
            departureTime: departureTime,
            status: isLate ? 'LATE' : 'PRESENT',
            hoursWorked: Math.round(hoursWorked * 100) / 100,
          },
        })
      }
    }
  }

  console.log('✅ Посещаемость создана')

  // Создаём штрафы и бонусы
  await prisma.penaltyBonus.create({
    data: {
      userId: manager1.id,
      type: 'BONUS',
      amount: 500000,
      reason: 'Перевыполнение плана',
      createdBy: rop.id,
    },
  })

  await prisma.penaltyBonus.create({
    data: {
      userId: operator3.id,
      type: 'PENALTY',
      amount: 200000,
      reason: 'Опоздание на работу',
      createdBy: rop.id,
    },
  })

  console.log('✅ Штрафы и бонусы созданы')

  console.log('🎉 База данных успешно заполнена!')
  console.log('\n📝 Данные для входа:')
  console.log('Владелец: owner / 123456')
  console.log('РОП: rop / 123456')
  console.log('Менеджер 1: manager1 / 123456')
  console.log('Менеджер 2: manager2 / 123456')
  console.log('Оператор 1: operator1 / 123456')
  console.log('Оператор 2: operator2 / 123456')
  console.log('Оператор 3: operator3 / 123456')
  console.log('Оператор 4: operator4 / 123456')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
