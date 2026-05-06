'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Calendar, Clock } from 'lucide-react'
import { getUser } from '@/lib/auth'

interface Attendance {
  id: string
  userId: string
  date: string
  arrivalTime: string | null
  departureTime: string | null
  status: 'PRESENT' | 'LATE' | 'ABSENT'
  hoursWorked: number | null
}

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const user = getUser()

  useEffect(() => {
    loadAttendances()
  }, [])

  const loadAttendances = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/attendance?userId=${user.id}`)
      const data = await response.json()
      setAttendances(data)

      // Находим запись за сегодня
      const today = new Date().toISOString().split('T')[0]
      const todayRecord = data.find((a: Attendance) => 
        a.date.startsWith(today)
      )
      setTodayAttendance(todayRecord || null)
    } catch (error) {
      console.error('Error loading attendances:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleArrival = async () => {
    if (!user || actionLoading) return
    
    setActionLoading(true)
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
        alert(data.message)
        loadAttendances()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error marking arrival:', error)
      alert('Ошибка при отметке прихода')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeparture = async () => {
    if (!user || actionLoading) return
    
    setActionLoading(true)
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
        alert(data.message)
        loadAttendances()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error marking departure:', error)
      alert('Ошибка при отметке ухода')
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    return days[date.getDay()]
  }

  // Статистика за месяц
  const stats = {
    totalDays: attendances.length,
    presentDays: attendances.filter(a => a.status === 'PRESENT').length,
    lateDays: attendances.filter(a => a.status === 'LATE').length,
    absentDays: attendances.filter(a => a.status === 'ABSENT').length,
    totalHours: attendances.reduce((sum, a) => sum + (a.hoursWorked || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-crown-navy">Посещаемость</h1>
        <p className="text-slate-600 mt-1">Отметка прихода и ухода</p>
      </div>

      {/* Кнопки отметки */}
      <div className="card">
        <h3 className="text-xl font-bold text-crown-navy mb-4">Отметить время</h3>
        <div className="flex gap-4 mb-6">
          <button 
            onClick={handleArrival}
            disabled={actionLoading || !!todayAttendance?.arrivalTime}
            className="btn btn-success flex items-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5" />
            {actionLoading ? 'Загрузка...' : 'Я пришёл'}
          </button>
          <button 
            onClick={handleDeparture}
            disabled={actionLoading || !todayAttendance?.arrivalTime || !!todayAttendance?.departureTime}
            className="btn btn-danger flex items-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-5 h-5" />
            {actionLoading ? 'Загрузка...' : 'Я ушёл'}
          </button>
        </div>

        {/* Текущий статус */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Дата</span>
            </div>
            <p className="text-lg font-bold text-crown-navy">
              {new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Время прихода</span>
            </div>
            <p className={`text-lg font-bold ${todayAttendance?.arrivalTime ? 'text-crown-navy' : 'text-slate-400'}`}>
              {formatTime(todayAttendance?.arrivalTime || null)}
            </p>
            {todayAttendance?.status === 'LATE' && (
              <span className="text-xs text-amber-600">Опоздание</span>
            )}
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Время ухода</span>
            </div>
            <p className={`text-lg font-bold ${todayAttendance?.departureTime ? 'text-crown-navy' : 'text-slate-400'}`}>
              {formatTime(todayAttendance?.departureTime || null)}
            </p>
            {todayAttendance?.hoursWorked && (
              <span className="text-xs text-emerald-600">
                {todayAttendance.hoursWorked.toFixed(2)} часов
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Статистика за месяц */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-slate-600 text-sm mb-1">Рабочих дней</p>
          <p className="text-3xl font-bold text-crown-navy">{stats.totalDays}</p>
          <p className="text-slate-500 text-sm mt-1">В этом месяце</p>
        </div>
        <div className="card">
          <p className="text-slate-600 text-sm mb-1">Присутствовал</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.presentDays}</p>
          <p className="text-emerald-600 text-sm mt-1">
            {stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0}% посещаемость
          </p>
        </div>
        <div className="card">
          <p className="text-slate-600 text-sm mb-1">Опозданий</p>
          <p className="text-3xl font-bold text-amber-600">{stats.lateDays}</p>
          <p className="text-slate-500 text-sm mt-1">После 09:00</p>
        </div>
        <div className="card">
          <p className="text-slate-600 text-sm mb-1">Отработано часов</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalHours.toFixed(1)}</p>
          <p className="text-slate-500 text-sm mt-1">За месяц</p>
        </div>
      </div>

      {/* История посещаемости */}
      <div className="card">
        <h3 className="text-xl font-bold text-crown-navy mb-4">История посещаемости</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-crown-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Загрузка...</p>
          </div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Нет записей о посещаемости</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Дата</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">День недели</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Приход</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Уход</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Часов</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Статус</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((attendance) => (
                  <AttendanceRow key={attendance.id} attendance={attendance} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

interface AttendanceRowProps {
  attendance: Attendance
}

function AttendanceRow({ attendance }: AttendanceRowProps) {
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    return days[date.getDay()]
  }

  const statusConfig = {
    PRESENT: { label: 'Присутствовал', class: 'badge-success' },
    LATE: { label: 'Опоздал', class: 'badge-warning' },
    ABSENT: { label: 'Отсутствовал', class: 'badge-danger' },
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4 text-sm font-medium">{formatDate(attendance.date)}</td>
      <td className="py-3 px-4 text-sm">{getDayName(attendance.date)}</td>
      <td className="py-3 px-4 text-sm">{formatTime(attendance.arrivalTime)}</td>
      <td className="py-3 px-4 text-sm">{formatTime(attendance.departureTime)}</td>
      <td className="py-3 px-4 text-sm font-medium">
        {attendance.hoursWorked ? attendance.hoursWorked.toFixed(2) : '-'}
      </td>
      <td className="py-3 px-4">
        <span className={`badge ${statusConfig[attendance.status].class}`}>
          {statusConfig[attendance.status].label}
        </span>
      </td>
    </tr>
  )
}
