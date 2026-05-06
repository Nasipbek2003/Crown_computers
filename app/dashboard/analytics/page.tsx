'use client'

import { TrendingUp, DollarSign, ShoppingCart, Users, Percent, Clock } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const salesData = [
  { date: '01.05', amount: 45 },
  { date: '02.05', amount: 52 },
  { date: '03.05', amount: 38 },
  { date: '04.05', amount: 65 },
  { date: '05.05', amount: 58 },
  { date: '06.05', amount: 72 },
]

const productTypeData = [
  { name: 'Ноутбуки', value: 58, color: '#3b82f6' },
  { name: 'Компьютеры', value: 42, color: '#10b981' },
]

const topModels = [
  { model: 'MacBook Pro 14', sales: 12, amount: 300 },
  { model: 'Gaming PC RTX 4080', sales: 8, amount: 256 },
  { model: 'Dell XPS 15', sales: 10, amount: 185 },
  { model: 'Lenovo Legion', sales: 7, amount: 140 },
  { model: 'HP Pavilion', sales: 6, amount: 90 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-crown-navy">Аналитика</h1>
        <p className="text-slate-600 mt-1">Детальная статистика и отчёты</p>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={DollarSign}
          title="Выручка за месяц"
          value="450М"
          change="+12%"
          positive={true}
          color="green"
        />
        <MetricCard
          icon={ShoppingCart}
          title="Всего продаж"
          value="43"
          change="+8%"
          positive={true}
          color="blue"
        />
        <MetricCard
          icon={Users}
          title="Новых клиентов"
          value="38"
          change="+15%"
          positive={true}
          color="purple"
        />
        <MetricCard
          icon={Percent}
          title="Конверсия"
          value="45%"
          change="-3%"
          positive={false}
          color="yellow"
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График продаж */}
        <div className="card">
          <h3 className="text-xl font-bold text-crown-navy mb-4">Динамика продаж</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="amount" stroke="#FFD700" strokeWidth={3} dot={{ fill: '#FFD700', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Соотношение типов товаров */}
        <div className="card">
          <h3 className="text-xl font-bold text-crown-navy mb-4">Структура продаж</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {productTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Топ моделей */}
      <div className="card">
        <h3 className="text-xl font-bold text-crown-navy mb-4">Топ-5 продаваемых моделей</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Модель</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Продано</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">сомма (млн)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Доля</th>
              </tr>
            </thead>
            <tbody>
              {topModels.map((model, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{model.model}</td>
                  <td className="py-3 px-4 text-sm text-right">{model.sales}</td>
                  <td className="py-3 px-4 text-sm text-right font-bold text-green-600">{model.amount}М</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-crown-gold h-2 rounded-full" 
                          style={{ width: `${(model.sales / 43) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600 w-12">
                        {Math.round((model.sales / 43) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Средний чек</h4>
          <p className="text-3xl font-bold text-crown-navy mb-1">18.7М</p>
          <p className="text-sm text-green-600">+5% к прошлому месяцу</p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Фонд оплаты труда</h4>
          <p className="text-3xl font-bold text-crown-navy mb-1">42М</p>
          <p className="text-sm text-slate-600">9.3% от выручки</p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Посещаемость</h4>
          <p className="text-3xl font-bold text-crown-navy mb-1">94%</p>
          <p className="text-sm text-green-600">Отличный показатель</p>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: any
  title: string
  value: string
  change: string
  positive: boolean
  color: 'green' | 'blue' | 'purple' | 'yellow'
}

function MetricCard({ icon: Icon, title, value, change, positive, color }: MetricCardProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <p className="text-slate-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-crown-navy">{value}</p>
    </div>
  )
}
