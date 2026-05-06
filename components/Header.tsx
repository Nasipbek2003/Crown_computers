'use client'

import { Bell, User } from 'lucide-react'
import { User as UserType } from '@/types'

interface HeaderProps {
  user: UserType
}

export default function Header({ user }: HeaderProps) {
  const roleNames = {
    OWNER: 'Владелец',
    ROP: 'РОП',
    MANAGER: 'Менеджер',
    OPERATOR: 'Оператор'
  }

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-crown-navy">Добро пожаловать, {user.name}!</h2>
          <p className="text-slate-500 text-sm">{roleNames[user.role]}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Уведомления */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          {/* Профиль */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-slate-500">{roleNames[user.role]}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
