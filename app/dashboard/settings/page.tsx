'use client'

import { useState, useEffect } from 'react'
import { Settings, Users } from 'lucide-react'
import { getUser } from '@/lib/auth'

interface User {
  id: string
  name: string
  login: string
  role: string
  salary: number
  salesPercent: number | null
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const currentUser = getUser()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const roleNames: Record<string, string> = {
    OWNER: 'Владелец',
    ROP: 'РОП',
    MANAGER: 'Менеджер',
    OPERATOR: 'Оператор'
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-crown-navy">Настройки</h1>
        <p className="text-slate-600 mt-1">Управление системой</p>
      </div>

      {currentUser?.role === 'OWNER' && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Управление планом продаж</h3>
              <p className="text-sm text-blue-700">
                Вы можете установить план продаж на месяц на главной странице дашборда. 
                Нажмите кнопку "Изменить план" в разделе "Выполнение плана".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Список сотрудников */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-crown-navy">Сотрудники</h2>
            <p className="text-sm text-slate-600">Список всех пользователей системы</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-crown-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Загрузка...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Имя</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Логин</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Роль</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Оклад</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">% от продаж</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-sm">{user.login}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-info">{roleNames[user.role]}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium">
                      {user.salary.toLocaleString()} сом
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {user.salesPercent ? `${user.salesPercent}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Информация о системе */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-slate-100 rounded-lg">
            <Settings className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-crown-navy">О системе</h2>
            <p className="text-sm text-slate-600">Информация о CRM системе</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Название:</span>
            <span className="font-medium">Crown Computers CRM</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Версия:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Пользователей:</span>
            <span className="font-medium">{users.length}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-600">База данных:</span>
            <span className="font-medium">PostgreSQL (Neon)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
