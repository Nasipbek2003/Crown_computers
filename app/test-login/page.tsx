'use client'

import { useState } from 'react'

export default function TestLoginPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('Отправка запроса...')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: 'manager1',
          password: '123456'
        }),
      })

      const data = await response.json()
      
      setResult(JSON.stringify(data, null, 2))
      
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    } catch (error: any) {
      setResult(`Ошибка: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkLocalStorage = () => {
    const user = localStorage.getItem('user')
    setResult(user ? JSON.stringify(JSON.parse(user), null, 2) : 'Пользователь не найден в localStorage')
  }

  const clearStorage = () => {
    localStorage.clear()
    setResult('localStorage очищен')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Тестирование входа</h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={testLogin}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Загрузка...' : 'Тест входа (manager1 / 123456)'}
          </button>

          <button
            onClick={checkLocalStorage}
            className="btn btn-secondary ml-4"
          >
            Проверить localStorage
          </button>

          <button
            onClick={clearStorage}
            className="btn btn-danger ml-4"
          >
            Очистить localStorage
          </button>

          <a href="/" className="btn btn-secondary ml-4 inline-block">
            Перейти на страницу входа
          </a>

          <a href="/dashboard" className="btn btn-secondary ml-4 inline-block">
            Перейти на дашборд
          </a>
        </div>

        {result && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Результат:</h2>
            <pre className="bg-slate-100 p-4 rounded-lg overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}

        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-4">📝 Тестовые аккаунты:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Менеджер:</strong> manager1 / 123456</p>
            <p><strong>Менеджер:</strong> manager2 / 123456</p>
            <p><strong>Оператор:</strong> operator1 / 123456</p>
            <p><strong>РОП:</strong> rop / 123456</p>
            <p><strong>Владелец:</strong> owner / 123456</p>
          </div>
        </div>

        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-4">🔍 Отладка:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>API Endpoint:</strong> POST /api/auth/login</p>
            <p><strong>Сервер:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p><strong>localStorage доступен:</strong> {typeof window !== 'undefined' && window.localStorage ? '✅ Да' : '❌ Нет'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
