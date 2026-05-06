// Роли пользователей
export type UserRole = 'OWNER' | 'ROP' | 'MANAGER' | 'OPERATOR'

// Пользователь
export interface User {
  id: string
  name: string
  login: string
  role: UserRole
  salary: number
  salesPercent?: number
  avatar?: string
}

// Посещаемость
export interface Attendance {
  id: string
  userId: string
  date: string
  arrivalTime: string | null
  departureTime: string | null
  status: 'present' | 'late' | 'absent'
  hoursWorked?: number
}

// Продажа
export interface Sale {
  id: string
  managerId: string
  productType: 'laptop' | 'computer'
  model: string
  price: number
  clientName?: string
  comment?: string
  createdAt: string
}

// Лид
export interface Lead {
  id: string
  operatorId: string
  clientName: string
  phone: string
  interest: 'laptop' | 'computer' | 'undefined'
  status: 'cold' | 'warm' | 'transferred'
  managerId?: string
  comment?: string
  createdAt: string
  convertedToSale?: boolean
}

// Штраф/Бонус
export interface PenaltyBonus {
  id: string
  userId: string
  type: 'penalty' | 'bonus'
  amount: number
  reason: string
  date: string
  createdBy: string
}

// План продаж
export interface SalesPlan {
  id: string
  month: string
  laptopTarget?: number
  computerTarget?: number
  totalAmountTarget?: number
}

// Статистика
export interface Statistics {
  totalSales: number
  totalAmount: number
  averageCheck: number
  conversionRate: number
}

// Достижение
export interface Achievement {
  id: string
  userId: string
  type: 'best_month' | 'no_late' | 'sniper' | 'top_operator'
  earnedAt: string
  month: string
}
