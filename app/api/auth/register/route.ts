import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, login, password, role, salary, salesPercent } = await request.json()

    // Валидация
    if (!name || !login || !password || !role) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь с таким логином
    const existingUser = await prisma.user.findUnique({
      where: { login },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким логином уже существует' },
        { status: 400 }
      )
    }

    // Валидация роли
    const validRoles = ['OWNER', 'ROP', 'MANAGER', 'OPERATOR']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Неверная роль' },
        { status: 400 }
      )
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создаём пользователя
    const user = await prisma.user.create({
      data: {
        name,
        login,
        password: hashedPassword,
        role,
        salary: salary ? parseFloat(salary) : 0,
        salesPercent: salesPercent ? parseFloat(salesPercent) : null,
      },
      select: {
        id: true,
        name: true,
        login: true,
        role: true,
        salary: true,
        salesPercent: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      user,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
