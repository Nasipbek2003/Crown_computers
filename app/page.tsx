'use client'

import { useState } from 'react'
import { Crown, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка входа')
        setLoading(false)
        return
      }

      // Сохраняем данные пользователя в localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Перенаправляем на дашборд
      router.push('/dashboard')
    } catch (err) {
      setError('Ошибка соединения с сервером')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-crown-navy via-slate-800 to-crown-lightNavy">
      <div className="w-full max-w-md px-6">
        {/* Логотип и название */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-crown-navy rounded-full mb-4 shadow-lg">
            <Crown className="w-12 h-12 text-crown-gold" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Crown Computers</h1>
          <p className="text-slate-300">Система управления продажами</p>
        </div>

        {/* Форма входа */}
        <div className="card">
          <h2 className="text-2xl font-bold text-crown-navy mb-6 text-center">Вход в систему</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Логин</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="input"
                placeholder="Введите логин"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Введите пароль"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Зарегистрироваться
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
