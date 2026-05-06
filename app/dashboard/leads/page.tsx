'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Phone, User, TrendingUp } from 'lucide-react'
import { getUser } from '@/lib/auth'

interface Lead {
  id: string
  operatorId: string
  clientName: string
  phone: string
  interest: 'LAPTOP' | 'COMPUTER' | 'UNDEFINED'
  status: 'COLD' | 'WARM' | 'TRANSFERRED'
  managerId?: string
  comment?: string
  convertedToSale: boolean
  createdAt: string
  operator: {
    id: string
    name: string
  }
}

interface Manager {
  id: string
  name: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const user = getUser()

  useEffect(() => {
    loadLeads()
    loadManagers()
  }, [])

  const loadLeads = async () => {
    try {
      const params = user?.role === 'OPERATOR' ? `?operatorId=${user.id}` : ''
      const response = await fetch(`/api/leads${params}`)
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadManagers = async () => {
    try {
      const response = await fetch('/api/users?role=MANAGER')
      const data = await response.json()
      setManagers(data)
    } catch (error) {
      console.error('Error loading managers:', error)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.clientName.toLowerCase().includes(filter.toLowerCase()) ||
                         lead.phone.includes(filter)
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Статистика
  const stats = {
    total: leads.length,
    cold: leads.filter(l => l.status === 'COLD').length,
    warm: leads.filter(l => l.status === 'WARM').length,
    transferred: leads.filter(l => l.status === 'TRANSFERRED').length,
    converted: leads.filter(l => l.convertedToSale).length,
    conversionRate: leads.filter(l => l.status === 'TRANSFERRED').length > 0
      ? Math.round((leads.filter(l => l.convertedToSale).length / leads.filter(l => l.status === 'TRANSFERRED').length) * 100)
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-crown-navy">Лиды</h1>
          <p className="text-slate-600 mt-1">Управление потенциальными клиентами</p>
        </div>
        {(user?.role === 'OPERATOR' || user?.role === 'ROP') && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить лид
          </button>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard title="Всего лидов" value={stats.total} color="blue" />
        <StatCard title="Холодные" value={stats.cold} color="slate" />
        <StatCard title="Тёплые" value={stats.warm} color="yellow" />
        <StatCard title="Переданы" value={stats.transferred} color="purple" />
        <StatCard title="Конверсия" value={`${stats.conversionRate}%`} color="green" />
        <StatCard title="Продажи" value={stats.converted} color="green" />
      </div>

      {/* Фильтры */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск по имени или телефону..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="all">Все статусы</option>
            <option value="COLD">Холодные</option>
            <option value="WARM">Тёплые</option>
            <option value="TRANSFERRED">Переданные</option>
          </select>
        </div>
      </div>

      {/* Таблица лидов */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-crown-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Загрузка лидов...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Лиды не найдены</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Дата</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Клиент</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Телефон</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Интерес</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Статус</th>
                  {user?.role !== 'OPERATOR' && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Оператор</th>
                  )}
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Комментарий</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    managers={managers}
                    showOperator={user?.role !== 'OPERATOR'}
                    onUpdate={loadLeads}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно добавления лида */}
      {showAddForm && (
        <AddLeadModal
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            loadLeads()
          }}
          operatorId={user?.id || ''}
        />
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  color: 'blue' | 'slate' | 'yellow' | 'purple' | 'green'
}

function StatCard({ title, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    slate: 'bg-slate-100 text-slate-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600'
  }

  return (
    <div className="card">
      <p className="text-slate-600 text-xs mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[1]}`}>{value}</p>
    </div>
  )
}

interface LeadRowProps {
  lead: Lead
  managers: Manager[]
  showOperator: boolean
  onUpdate: () => void
}

function LeadRow({ lead, managers, showOperator, onUpdate }: LeadRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    status: lead.status,
    managerId: lead.managerId || '',
    comment: lead.comment || ''
  })

  const interestLabels = {
    LAPTOP: 'Ноутбук',
    COMPUTER: 'Компьютер',
    UNDEFINED: 'Не определён'
  }

  const statusLabels = {
    COLD: 'Холодный',
    WARM: 'Тёплый',
    TRANSFERRED: 'Передан'
  }

  const statusColors = {
    COLD: 'badge-info',
    WARM: 'badge-warning',
    TRANSFERRED: 'badge-success'
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          ...editData,
          managerId: editData.managerId || null
        })
      })

      if (response.ok) {
        setIsEditing(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4 text-sm">{formatDate(lead.createdAt)}</td>
      <td className="py-3 px-4 text-sm font-medium">{lead.clientName}</td>
      <td className="py-3 px-4 text-sm">
        <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <Phone className="w-4 h-4" />
          {lead.phone}
        </a>
      </td>
      <td className="py-3 px-4 text-sm">{interestLabels[lead.interest]}</td>
      <td className="py-3 px-4">
        {isEditing ? (
          <select
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
            className="input text-sm py-1"
          >
            <option value="COLD">Холодный</option>
            <option value="WARM">Тёплый</option>
            <option value="TRANSFERRED">Передан</option>
          </select>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`badge ${statusColors[lead.status]}`}>
              {statusLabels[lead.status]}
            </span>
            {lead.convertedToSale && (
              <span className="badge badge-success">✓ Продажа</span>
            )}
          </div>
        )}
      </td>
      {showOperator && (
        <td className="py-3 px-4 text-sm">{lead.operator.name}</td>
      )}
      <td className="py-3 px-4 text-sm max-w-xs truncate">
        {isEditing ? (
          <input
            type="text"
            value={editData.comment}
            onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
            className="input text-sm py-1"
            placeholder="Комментарий"
          />
        ) : (
          lead.comment || '-'
        )}
      </td>
      <td className="py-3 px-4 text-right">
        {isEditing ? (
          <div className="flex justify-end gap-2">
            {editData.status === 'TRANSFERRED' && (
              <select
                value={editData.managerId}
                onChange={(e) => setEditData({ ...editData, managerId: e.target.value })}
                className="input text-sm py-1 w-32"
              >
                <option value="">Выбрать</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}
            <button onClick={handleSave} className="text-green-600 hover:text-green-800 text-sm font-medium">
              Сохранить
            </button>
            <button onClick={() => setIsEditing(false)} className="text-slate-600 hover:text-slate-800 text-sm font-medium">
              Отмена
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Изменить
          </button>
        )}
      </td>
    </tr>
  )
}

interface AddLeadModalProps {
  onClose: () => void
  onSuccess: () => void
  operatorId: string
}

function AddLeadModal({ onClose, onSuccess, operatorId }: AddLeadModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    interest: 'UNDEFINED',
    status: 'COLD',
    comment: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          operatorId
        })
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating lead:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-crown-navy mb-6">Добавить лид</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Имя клиента *</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="input"
                placeholder="Иван Иванов"
                required
              />
            </div>

            <div>
              <label className="label">Телефон *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="+998901234567"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Интерес *</label>
              <select
                value={formData.interest}
                onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                className="input"
                required
              >
                <option value="UNDEFINED">Не определён</option>
                <option value="LAPTOP">Ноутбук</option>
                <option value="COMPUTER">Компьютер</option>
              </select>
            </div>

            <div>
              <label className="label">Статус *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
                required
              >
                <option value="COLD">Холодный</option>
                <option value="WARM">Тёплый</option>
                <option value="TRANSFERRED">Передан менеджеру</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Комментарий</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="input"
              rows={3}
              placeholder="Дополнительная информация о клиенте..."
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
