'use client'

import { Crown, Home, Clock, ShoppingCart, Users, DollarSign, TrendingUp, Award, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserRole } from '@/types'

interface SidebarProps {
  userRole: UserRole
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { icon: Home, label: 'Главная', href: '/dashboard', roles: ['OWNER', 'ROP', 'MANAGER', 'OPERATOR'] },
    { icon: Clock, label: 'Посещаемость', href: '/dashboard/attendance', roles: ['OWNER', 'ROP', 'MANAGER', 'OPERATOR'] },
    { icon: ShoppingCart, label: 'Продажи', href: '/dashboard/sales', roles: ['OWNER', 'ROP', 'MANAGER'] },
    { icon: Users, label: 'Лиды', href: '/dashboard/leads', roles: ['OWNER', 'ROP', 'OPERATOR'] },
    { icon: DollarSign, label: 'Штрафы/Бонусы', href: '/dashboard/penalties', roles: ['OWNER', 'ROP', 'MANAGER', 'OPERATOR'] },
    { icon: TrendingUp, label: 'Аналитика', href: '/dashboard/analytics', roles: ['OWNER', 'ROP'] },
    { icon: Award, label: 'Лидеры', href: '/dashboard/leaderboard', roles: ['OWNER', 'ROP', 'MANAGER', 'OPERATOR'] },
    { icon: Settings, label: 'Настройки', href: '/dashboard/settings', roles: ['OWNER', 'ROP'] },
  ]

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole))

  return (
    <aside className="w-64 bg-crown-navy h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      {/* Логотип */}
      <div className="p-6 border-b border-crown-lightNavy flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-crown-navy rounded-lg flex items-center justify-center border border-crown-gold">
            <Crown className="w-6 h-6 text-crown-gold" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Crown</h1>
            <p className="text-slate-400 text-xs">Computers CRM</p>
          </div>
        </div>
      </div>

      {/* Меню */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {filteredMenu.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-slate-700 text-white font-medium'
                      : 'text-slate-300 hover:bg-crown-lightNavy hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Выход */}
      <div className="p-4 border-t border-crown-lightNavy flex-shrink-0">
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('user')
              window.location.href = '/'
            }
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-rose-600 hover:text-white transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  )
}
