'use client'

import { useState, useEffect } from 'react'
import { Plus, DollarSign, AlertCircle, Award } from 'lucide-react'
import { getUser } from '@/lib/auth'

interface PenaltyBonus {
  id: string
  userId: string
  type: 'PENALTY' | 'BONUS'
  amount: number
  reason: string
  date: string
  createdBy: string
  user: {
    id: string
    name: string
  }
}

interface User {
  id: string
  name: string
  role: string
}

export default function PenaltiesPage() {
  const [items, setItems] = useState<PenaltyBonus[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const currentUser = getUser()

  useEffect(() => {
    loadItems()
    if (currentUser?.role === 'ROP' || currentUser?.role === 'OWNER') {
      loadUsers()
    }
  }, [])

  const loadItems = async () => {
    try {
      const params = currentUser?.role === 'MANAGER' || currentUser?.role === 'OPERATOR' 
        ? `?userId=${currentUser.id}` 
        : ''
      const response = await fetch(`/api/penalties${params}`)
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Error loading penalties:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту запись?')) return

    try {
      const response = await fetch(`/api/penalties?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadItems()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const stats = {
    totalBonuses: items.filter(i => i.type === 'BONUS').reduce((sum, i) => sum + i.amount, 0),
    totalPenalties: items.filter(i => i.type === 'PENALTY').reduce((sum, i) => sum + i.amount, 0),
    bonusCount: items.filter(i => i.type === 'BONUS').length,
    penaltyCount: items.filter(i => i.type === 'PENALTY').length,
  }

  const canManage = currentUser?.role === 'ROP' || currentUser?.role === 'OWNER'

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-crown-navy">Штрафы и бонусы</h1>
          <p className="text-slate-600 mt-1">
            {canManage ? 'Управление штрафами и бонусами' : 'Мои штрафы и бонусы'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить запись
          </button>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Всего бонусов</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalBonuses.toLocaleString()} сом
              </p>
              <p className="text-slate-500 text-xs mt-1">{stats.bonusCount} записей</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Всего штрафов</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.totalPenalties.toLocaleString()} сом
              </p>
              <p className="text-slate-500 text-xs mt-1">{stats.penaltyCount} записей</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Баланс</p>
              <p className={`text-2xl font-bold ${stats.totalBonuses - stats.totalPenalties >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(stats.totalBonuses - stats.totalPenalties).toLocaleString()} сом
              </p>
              <p className="text-slate-500 text-xs mt-1">За текущий месяц</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Всего записей</p>
              <p className="text-2xl font-bold text-crown-navy">
                {items.length}
              </p>
              <p className="text-slate-500 text-xs mt-1">За все время</p>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-crown-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Загрузка...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Записи не найдены</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Дата</th>
                  {canManage && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Сотрудник</th>
                  )}
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Тип</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">сомма</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Причина</th>
                  {canManage && (
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Действия</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm">
                      {new Date(item.date).toLocaleDateString('ru-RU')}
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-sm font-medium">{item.user.name}</td>
                    )}
                    <td className="py-3 px-4">
                      <span className={`badge ${item.type === 'BONUS' ? 'badge-success' : 'badge-danger'}`}>
                        {item.type === 'BONUS' ? '💰 Бонус' : '⚠️ Штраф'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-sm font-bold text-right ${item.type === 'BONUS' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.type === 'BONUS' ? '+' : '-'}{item.amount.toLocaleString()} сом
                    </td>
                    <td className="py-3 px-4 text-sm">{item.reason}</td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Удалить
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {showAddForm && (
        <AddPenaltyModal
          users={users}
          currentUserId={currentUser?.id || ''}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            loadItems()
          }}
        />
      )}
    </div>
  )
}

interface AddPenaltyModalProps {
  users: User[]
  currentUserId: string
  onClose: () => void
  onSuccess: () => void
}

function AddPenaltyModal({ users, currentUserId, onClose, onSuccess }: AddPenaltyModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    type: 'BONUS',
    amount: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/penalties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: currentUserId
        })
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating penalty:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold text-crown-navy mb-6">Добавить запись</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Сотрудник *</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="input"
              required
            >
              <option value="">Выберите сотрудника</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Тип *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
                required
              >
                <option value="BONUS">Бонус</option>
                <option value="PENALTY">Штраф</option>
              </select>
            </div>

            <div>
              <label className="label">сомма (сом) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input"
                placeholder="500000"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Причина *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input"
              rows={3}
              placeholder="Укажите причину..."
              required
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
