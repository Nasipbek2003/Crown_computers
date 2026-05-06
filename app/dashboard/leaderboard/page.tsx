'use client'

import { Trophy, Medal, Award, TrendingUp, Flame, Target, Zap } from 'lucide-react'

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-crown-navy">Таблица лидеров</h1>
        <p className="text-slate-600 mt-1">Рейтинг сотрудников по результатам</p>
      </div>

      {/* Топ 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TopCard
          position={2}
          name="Мария Смирнова"
          role="Менеджер"
          sales={18}
          amount="340 000 000"
          color="silver"
        />
        <TopCard
          position={1}
          name="Иван Петров"
          role="Менеджер"
          sales={24}
          amount="450 000 000"
          color="gold"
        />
        <TopCard
          position={3}
          name="Алексей Козлов"
          role="Оператор"
          sales={45}
          amount="Лидов передано"
          color="bronze"
        />
      </div>

      {/* Достижения */}
      <div className="card">
        <h3 className="text-xl font-bold text-crown-navy mb-4">Достижения месяца</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AchievementCard
            icon={Trophy}
            title="Лучший месяц"
            winner="Иван Петров"
            description="Наибольшая сомма продаж"
          />
          <AchievementCard
            icon={Flame}
            title="Без опозданий"
            winner="Мария Смирнова"
            description="Ни одного опоздания"
          />
          <AchievementCard
            icon={Target}
            title="Снайпер"
            winner="Анна Волкова"
            description="Конверсия выше 50%"
          />
          <AchievementCard
            icon={Zap}
            title="Топ оператор"
            winner="Алексей Козлов"
            description="Больше всех лидов"
          />
        </div>
      </div>

      {/* Рейтинг менеджеров */}
      <div className="card">
        <h3 className="text-xl font-bold text-crown-navy mb-4">Рейтинг менеджеров</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Место</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Менеджер</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Продаж</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">сомма</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Средний чек</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Прогресс</th>
              </tr>
            </thead>
            <tbody>
              <LeaderRow
                position={1}
                name="Иван Петров"
                sales={24}
                amount="450 000 000"
                avgCheck="18 750 000"
                progress={96}
              />
              <LeaderRow
                position={2}
                name="Мария Смирнова"
                sales={18}
                amount="340 000 000"
                avgCheck="18 888 889"
                progress={85}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Рейтинг операторов */}
      <div className="card">
        <h3 className="text-xl font-bold text-crown-navy mb-4">Рейтинг операторов</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Место</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Оператор</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Лидов добавлено</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Передано</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Конверсия</th>
              </tr>
            </thead>
            <tbody>
              <OperatorRow
                position={1}
                name="Алексей Козлов"
                leadsAdded={65}
                leadsTransferred={45}
                conversion={52}
              />
              <OperatorRow
                position={2}
                name="Анна Волкова"
                leadsAdded={58}
                leadsTransferred={38}
                conversion={48}
              />
              <OperatorRow
                position={3}
                name="Дмитрий Соколов"
                leadsAdded={52}
                leadsTransferred={32}
                conversion={42}
              />
              <OperatorRow
                position={4}
                name="Елена Морозова"
                leadsAdded={48}
                leadsTransferred={28}
                conversion={38}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

interface TopCardProps {
  position: number
  name: string
  role: string
  sales: number
  amount: string
  color: 'gold' | 'silver' | 'bronze'
}

function TopCard({ position, name, role, sales, amount, color }: TopCardProps) {
  const colorClasses = {
    gold: 'from-amber-400 to-amber-600',
    silver: 'from-slate-300 to-slate-500',
    bronze: 'from-orange-400 to-orange-600'
  }

  const icons = {
    gold: <Trophy className="w-12 h-12 text-white" />,
    silver: <Medal className="w-12 h-12 text-white" />,
    bronze: <Award className="w-12 h-12 text-white" />
  }

  return (
    <div className={`card relative overflow-hidden ${position === 1 ? 'md:scale-105 md:shadow-xl' : ''}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`}></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[color]} rounded-full flex items-center justify-center shadow-md`}>
            {icons[color]}
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-crown-navy">#{position}</p>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-crown-navy mb-1">{name}</h3>
        <p className="text-slate-600 text-sm mb-4">{role}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600 text-sm">Результат:</span>
            <span className="font-bold text-crown-navy">{sales}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 text-sm">сомма:</span>
            <span className="font-bold text-green-600 text-sm">{amount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AchievementCardProps {
  icon: any
  title: string
  winner: string
  description: string
}

function AchievementCard({ icon: Icon, title, winner, description }: AchievementCardProps) {
  return (
    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
      <div className="mb-2">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
      <h4 className="font-bold text-crown-navy mb-1">{title}</h4>
      <p className="text-sm text-emerald-600 font-medium mb-1">{winner}</p>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  )
}

interface LeaderRowProps {
  position: number
  name: string
  sales: number
  amount: string
  avgCheck: string
  progress: number
}

function LeaderRow({ position, name, sales, amount, avgCheck, progress }: LeaderRowProps) {
  const medalColors = {
    1: 'text-amber-600',
    2: 'text-slate-500',
    3: 'text-orange-600'
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <span className={`text-2xl font-bold ${medalColors[position as keyof typeof medalColors] || 'text-slate-400'}`}>
          #{position}
        </span>
      </td>
      <td className="py-3 px-4 text-sm font-medium">{name}</td>
      <td className="py-3 px-4 text-sm text-right">{sales}</td>
      <td className="py-3 px-4 text-sm text-right font-bold text-green-600">{amount} сом</td>
      <td className="py-3 px-4 text-sm text-right">{avgCheck} сом</td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-200 rounded-full h-2">
            <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-sm font-medium text-slate-600 w-12">{progress}%</span>
        </div>
      </td>
    </tr>
  )
}

interface OperatorRowProps {
  position: number
  name: string
  leadsAdded: number
  leadsTransferred: number
  conversion: number
}

function OperatorRow({ position, name, leadsAdded, leadsTransferred, conversion }: OperatorRowProps) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <span className="text-lg font-bold text-slate-600">#{position}</span>
      </td>
      <td className="py-3 px-4 text-sm font-medium">{name}</td>
      <td className="py-3 px-4 text-sm text-right">{leadsAdded}</td>
      <td className="py-3 px-4 text-sm text-right font-medium text-blue-600">{leadsTransferred}</td>
      <td className="py-3 px-4 text-right">
        <span className={`badge ${conversion >= 50 ? 'badge-success' : 'badge-warning'}`}>
          {conversion}%
        </span>
      </td>
    </tr>
  )
}
