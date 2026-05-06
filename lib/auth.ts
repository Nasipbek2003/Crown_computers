import { User } from '@/types'

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function setUser(user: User) {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearUser() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('user')
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}
