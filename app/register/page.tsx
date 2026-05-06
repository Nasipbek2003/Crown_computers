'use client'

import { useState } from 'react'
import { Crown, UserPlus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    login: '',
    password: '',
    confirmPassword: '',
    role: 'OPERATOR',
    salary: '',
    salesPercent: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          login: formData.login,
          password: formData.password,
          role: formData.role,
          salary: formData.salary || 0,
          salesPercent: formData.salesPercent || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка регистрации')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (err) {
      setError('Ошибка соединения с сервером')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-crown-navy via-slate-800 to-crown-lightNavy">
      <div className="w-full max-w-2xl px-6">
        {/* Логотип и название */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-crown-navy rounded-full mb-4 shadow-lg">
            <Crown className="w-12 h-12 text-crown-gold" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Crown Computers</h1>
          <p className="text-slate-300">Регистрация нового пользователя</p>
        </div>

        {/* Форма регистрации */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-crown-navy">Создать аккаунт</h2>
            <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Вход
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              Регистрация успешна! Перенаправление на страницу входа...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Полное имя *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Иван Петров"
                  required
                />
              </div>

              <div>
                <label className="label">Логин *</label>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  className="input"
                  placeholder="ivan_petrov"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Пароль *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Минимум 6 символов"
                  required
                />
              </div>

              <div>
                <label className="label">Подтвердите пароль *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input"
                  placeholder="Повторите пароль"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Роль *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="OPERATOR">Оператор</option>
                <option value="MANAGER">Менеджер</option>
                <option value="ROP">РОП</option>
                <option value="OWNER">Владелец</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                {formData.role === 'OPERATOR' && 'Работа с лидами и клиентами'}
                {formData.role === 'MANAGER' && 'Добавление продаж и работа с клиентами'}
                {formData.role === 'ROP' && 'Управление командой и аналитика'}
                {formData.role === 'OWNER' && 'Полный доступ ко всей системе'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Оклад (сом)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="input"
                  placeholder="5000000"
                />
              </div>

              {formData.role === 'MANAGER' && (
                <div>
                  <label className="label">Процент от продаж (%)</label>
                  <input
                    type="number"
                    name="salesPercent"
                    value={formData.salesPercent}
                    onChange={handleChange}
                    className="input"
                    placeholder="3"
                    step="0.1"
                  />
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-5 h-5" />
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Уже есть аккаунт?{' '}
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                Войти
              </Link>
            </p>
          </div>
        </div>

        {/* Футер */}
        <p className="text-center text-slate-400 text-sm mt-6">
          © 2026 Crown Computers. Все права защищены.
        </p>
      </div>
    </div>
  )
}
