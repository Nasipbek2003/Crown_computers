'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { User } from '@/types'
import { getUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getUser()
    
    if (!currentUser) {
      router.push('/')
      return
    }
    
    setUser(currentUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-crown-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={user.role} />
      <div className="flex-1 flex flex-col ml-64">
        <Header user={user} />
        <main className="flex-1 p-8 bg-slate-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
