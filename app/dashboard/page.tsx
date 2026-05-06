'use client'

import { Clock, DollarSign, TrendingUp, Award, CheckCircle, XCircle, Target, Edit, Users, UserCheck, UserX, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getUser } from '@/lib/auth'

interface SalesPlan {
  month: string
  totalAmountTarget: number | null
}

interface Statistics {
  totalSales: number
  totalAmount: number
  sales?: {
    totalSales: number
  }
  salary?: {
    totalSalary: number
    bonuses: number
  }
  attendance?: {
    totalHours: number
  }
}

interface Attendance {
  id: string
  date: string
  arrivalTime: string | null
  departureTime: string | null
  status: string
  hoursWorked: number | null
  userId: string
  user?: {
    id: string
    name: string
    role: string
  }
}

interface TeamMember {
  id: string
  name: string
  role: string
  status: 'working' | 'late' | 'absent'
  arrivalTime: string | null
}

export default function DashboardPage() {
  const [plan, setPlan] = useState<SalesPlan | null>(null)
  const [stats, setStats] = useState<Statistics | null>(null)
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [teamAttendance, setTeamAttendance] = useState<TeamMember[]>([])
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const user = getUser()

  useEffect(() => {
    loadData()
    if (user?.role === 'OWNER') {
      loadTeamAttendance()
    } else {
      loadTodayAttendance()
    }
  }, [])

  const loadTeamAttendance = async () => {
    try {
      const response = await fetch('/api/users')
      const users = await response.json()
      
      const today = new Date().toISOString().split('T')[0]
      
      const teamData = await Promise.all(
        users.map(async (u: any) => {
          try {
            const attResponse = await fetch(`/api/attendance?userId=${u.id}`)
            const attData = await attResponse.json()
            const todayAtt = attData.find((a: Attendance) => a.date.startsWith(today))
            
            let status: 'working' | 'late' | 'absent' = 'absent'
            if (todayAtt?.arrivalTime && !todayAtt.departureTime) {
              status = todayAtt.status === 'LATE' ? 'late' : 'working'
            } else if (todayAtt?.departureTime) {
              status = 'absent' // ушёл
            }
            
            return {
              id: u.id,
              name: u.name,
              role: u.role,
              status,
              arrivalTime: todayAtt?.arrivalTime || null
            }
          } catch {
            return {
              id: u.id,
              name: u.name,
              role: u.role,
              status: 'absent' as const,
              arrivalTime: null
            }
          }
        })
      )
      
      setTeamAttendance(teamData)
    } catch (error) {
      console.error('Error loading team attendance:', error)
    }
  }

  const loadData = async () => {
    try {
      // Загружаем план
      const planResponse = await fetch('/api/plans')
      const planData = await planResponse.json()
      setPlan(planData)

      // Загружаем статистику
      if (user) {
        const statsResponse = await fetch(`/api/statistics?userId=${user.id}&role=${user.role}`)
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTodayAttendance = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/attendance?userId=${user.id}`)
      const data = await response.json()
      
      // Находим запись за сегодня
      const today = new Date().toISOString().split('T')[0]
      const todayAttendance = data.find((a: Attendance) => 
        a.date.startsWith(today)
      )
      
      setAttendance(todayAttendance || null)
    } catch (error) {
      console.error('Error loading attendance:', error)
    }
  }

  const handleArrival = async () => {
    if (!user || attendanceLoading) return
    
    setAttendanceLoading(true)
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'arrival'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setAttendance(data.attendance)
        alert(data.message)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error marking arrival:', error)
      alert('Ошибка при отметке прихода')
    } finally {
      setAttendanceLoading(false)
    }
  }

  const handleDeparture = async () => {
    if (!user || attendanceLoading) return
    
    setAttendanceLoading(true)
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'departure'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setAttendance(data.attendance)
        alert(data.message)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error marking departure:', error)
      alert('Ошибка при отметке ухода')
    } finally {
      setAttendanceLoading(false)
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusText = () => {
    if (!attendance) return 'Не отмечен'
    if (attendance.departureTime) return 'Ушёл'
    if (attendance.arrivalTime) {
      return attendance.status === 'LATE' ? 'Пришёл (опоздание)' : 'Пришёл'
    }
    return 'Не отмечен'
  }

  const getStatusColor = () => {
    if (!attendance) return 'text-slate-600'
    if (attendance.departureTime) return 'text-blue-600'
    if (attendance.status === 'LATE') return 'text-amber-600'
    if (attendance.status === 'PRESENT') return 'text-emerald-600'
    return 'text-slate-600'
  }

  const planProgress = plan?.totalAmountTarget && stats?.totalAmount
    ? Math.round((stats.totalAmount / plan.totalAmountTarget) * 100)
    : 0

  // Для владельца показываем аналитику команды
  if (user?.role === 'OWNER') {
    const workingCount = teamAttendance.filter(t => t.status === 'working').length
    const lateCount = teamAttendance.filter(t => t.status === 'late').length
    const absentCount = teamAttendance.filter(t => t.status === 'absent').length

    return (
      <div className="space-y-6">
        {/* Заголовок */}
        <div>
          <h1 className="text-3xl font-bold text-crown-navy">Добро пожаловать, {user.name}!</h1>
          <p className="text-slate-600 mt-1">Владелец</p>
        </div>

        {/* Статистика команды */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Всего сотрудников"
            value={teamAttendance.length.toString()}
            subtitle="В команде"
            color="blue"
          />
          <StatCard
            icon={UserCheck}
            title="На работе"
            value={workingCount.toString()}
            subtitle="Сейчас работают"
            color="green"
          />
          <StatCard
            icon={AlertCircle}
            title="Опоздали"
            value={lateCount.toString()}
            subtitle="После 09:00"
            color="yellow"
          />
          <StatCard
            icon={UserX}
            title="Отсутствуют"
            value={absentCount.toString()}
            subtitle="Не пришли"
            color="purple"
          />
        </div>

        {/* Кто на работе */}
        <div className="card">
          <h3 className="text-xl font-bold text-crown-navy mb-4">Кто сейчас на работе</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-crown-navy border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : teamAttendance.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Нет данных о сотрудниках</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamAttendance.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>

        {/* Прогресс плана */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-crown-navy">Выполнение плана</h3>
                <p className="text-sm text-slate-600">План продаж на месяц</p>
              </div>
            </div>
            <button
              onClick={() => setShowPlanModal(true)}
              className="btn btn-secondary flex items-center gap-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              Изменить план
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-crown-navy border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Общий план продаж</span>
                  <span className="text-sm text-slate-600">
                    {stats?.totalAmount ? `${(stats.totalAmount / 1000000).toFixed(1)}М` : '0М'} / {plan?.totalAmountTarget ? `${(plan.totalAmountTarget / 1000000).toFixed(0)}М` : '0М'} сом
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all ${planProgress >= 100 ? 'bg-emerald-600' : planProgress >= 75 ? 'bg-blue-600' : planProgress >= 50 ? 'bg-amber-500' : 'bg-slate-400'}`}
                    style={{ width: `${Math.min(planProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-slate-500">
                    {planProgress >= 100 ? '✅ План выполнен!' : `Осталось: ${plan?.totalAmountTarget && stats?.totalAmount ? ((plan.totalAmountTarget - stats.totalAmount) / 1000000).toFixed(1) : '0'}М сом`}
                  </span>
                  <span className="text-sm font-bold text-crown-navy">{planProgress}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Модальное окно изменения плана */}
        {showPlanModal && (
          <PlanModal
            currentPlan={plan}
            onClose={() => setShowPlanModal(false)}
            onSuccess={() => {
              setShowPlanModal(false)
              loadData()
            }}
          />
        )}
      </div>
    )
  }

  // Для остальных ролей - обычный дашборд
  return (
    <div className="space-y-6">
      {/* Кнопки посещаемости */}
      <div className="card">
        <h3 className="text-xl font-bold text-crown-navy mb-4">Посещаемость</h3>
        <div className="flex gap-4">
          <button 
            onClick={handleArrival}
            disabled={attendanceLoading || !!attendance?.arrivalTime}
            className="btn btn-success flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5" />
            {attendanceLoading ? 'Загрузка...' : 'Я пришёл'}
          </button>
          <button 
            onClick={handleDeparture}
            disabled={attendanceLoading || !attendance?.arrivalTime || !!attendance?.departureTime}
            className="btn btn-danger flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-5 h-5" />
            {attendanceLoading ? 'Загрузка...' : 'Я ушёл'}
          </button>
        </div>
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Статус</p>
              <p className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Время прихода</p>
              <p className="text-sm font-medium text-slate-700">
                {formatTime(attendance?.arrivalTime || null)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Время ухода</p>
              <p className="text-sm font-medium text-slate-700">
                {formatTime(attendance?.departureTime || null)}
              </p>
            </div>
          </div>
          {attendance?.hoursWorked && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500">Отработано сегодня</p>
              <p className="text-lg font-bold text-crown-navy">
                {attendance.hoursWorked.toFixed(2)} часов
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={TrendingUp}
          title="Мои продажи"
          value={stats?.sales?.totalSales?.toString() || '0'}
          subtitle="За текущий месяц"
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          title="Моя зарплата"
          value={stats?.salary?.totalSalary ? `${(stats.salary.totalSalary / 1000000).toFixed(1)}М` : '0'}
          subtitle="Текущий расчёт"
          color="green"
        />
        <StatCard
          icon={Award}
          title="Бонусы"
          value={stats?.salary?.bonuses ? `${(stats.salary.bonuses / 1000000).toFixed(1)}М` : '0'}
          subtitle="За месяц"
          color="yellow"
        />
        <StatCard
          icon={Clock}
          title="Отработано"
          value={stats?.attendance?.totalHours ? `${stats.attendance.totalHours} ч` : '0 ч'}
          subtitle="За месяц"
          color="purple"
        />
      </div>

      {/* Прогресс плана */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-crown-navy">Выполнение плана</h3>
              <p className="text-sm text-slate-600">План продаж на месяц</p>
            </div>
          </div>
          {user?.role === 'OWNER' && (
            <button
              onClick={() => setShowPlanModal(true)}
              className="btn btn-secondary flex items-center gap-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              Изменить план
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-crown-navy border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Общий план продаж</span>
                <span className="text-sm text-slate-600">
                  {stats?.totalAmount ? `${(stats.totalAmount / 1000000).toFixed(1)}М` : '0М'} / {plan?.totalAmountTarget ? `${(plan.totalAmountTarget / 1000000).toFixed(0)}М` : '0М'} сом
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all ${planProgress >= 100 ? 'bg-emerald-600' : planProgress >= 75 ? 'bg-blue-600' : planProgress >= 50 ? 'bg-amber-500' : 'bg-slate-400'}`}
                  style={{ width: `${Math.min(planProgress, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-slate-500">
                  {planProgress >= 100 ? '✅ План выполнен!' : `Осталось: ${plan?.totalAmountTarget && stats?.totalAmount ? ((plan.totalAmountTarget - stats.totalAmount) / 1000000).toFixed(1) : '0'}М сом`}
                </span>
                <span className="text-sm font-bold text-crown-navy">{planProgress}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Последние продажи */}
      <div className="card">
        <h3 className="text-xl font-bold text-crown-navy mb-4">Последние продажи</h3>
        <div className="space-y-3">
          <SaleItem
            model="MacBook Pro 14"
            type="Ноутбук"
            price="25 000 000"
            date="Сегодня, 14:30"
          />
          <SaleItem
            model="Dell XPS 15"
            type="Ноутбук"
            price="18 500 000"
            date="Вчера, 16:45"
          />
          <SaleItem
            model="Gaming PC RTX 4080"
            type="Компьютер"
            price="32 000 000"
            date="2 дня назад"
          />
        </div>
      </div>

      {/* Модальное окно изменения плана */}
      {showPlanModal && (
        <PlanModal
          currentPlan={plan}
          onClose={() => setShowPlanModal(false)}
          onSuccess={() => {
            setShowPlanModal(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

interface TeamMemberCardProps {
  member: TeamMember
}

function TeamMemberCard({ member }: TeamMemberCardProps) {
  const roleNames: Record<string, string> = {
    OWNER: 'Владелец',
    ROP: 'РОП',
    MANAGER: 'Менеджер',
    OPERATOR: 'Оператор'
  }

  const statusConfig = {
    working: {
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      icon: 'text-emerald-600',
      label: 'На работе'
    },
    late: {
      bg: 'bg-amber-50 border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      icon: 'text-amber-600',
      label: 'Опоздал'
    },
    absent: {
      bg: 'bg-slate-50 border-slate-200',
      badge: 'bg-slate-100 text-slate-700',
      icon: 'text-slate-600',
      label: 'Отсутствует'
    }
  }

  const config = statusConfig[member.status]

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`p-4 rounded-lg border ${config.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-crown-navy">{member.name}</p>
          <p className="text-xs text-slate-600">{roleNames[member.role]}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${config.badge}`}>
          {config.label}
        </span>
      </div>
      {member.arrivalTime && (
        <div className="flex items-center gap-2 text-sm">
          <Clock className={`w-4 h-4 ${config.icon}`} />
          <span className="text-slate-700">Пришёл в {formatTime(member.arrivalTime)}</span>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: any
  title: string
  value: string
  subtitle: string
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

function StatCard({ icon: Icon, title, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    yellow: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-600 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-crown-navy">{value}</p>
          <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

interface SaleItemProps {
  model: string
  type: string
  price: string
  date: string
}

function SaleItem({ model, type, price, date }: SaleItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div>
        <p className="font-medium text-crown-navy">{model}</p>
        <p className="text-sm text-slate-500">{type}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-emerald-600">{price} сом</p>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
    </div>
  )
}

interface PlanModalProps {
  currentPlan: SalesPlan | null
  onClose: () => void
  onSuccess: () => void
}

function PlanModal({ currentPlan, onClose, onSuccess }: PlanModalProps) {
  const [amount, setAmount] = useState(currentPlan?.totalAmountTarget?.toString() || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const now = new Date()
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          totalAmountTarget: parseFloat(amount)
        })
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving plan:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-crown-navy mb-6">Установить план продаж</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">План продаж на месяц (сом)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="600000000"
              required
              step="1000000"
            />
            <p className="text-xs text-slate-500 mt-1">
              Текущий план: {currentPlan?.totalAmountTarget ? `${(currentPlan.totalAmountTarget / 1000000).toFixed(0)}М сом` : 'Не установлен'}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              💡 <strong>Совет:</strong> Рекомендуемый план - 600М сом в месяц
            </p>
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
