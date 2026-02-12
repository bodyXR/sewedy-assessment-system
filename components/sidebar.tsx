'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Users, BookOpen, LogOut } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navItems = [
    {
      label: 'Students',
      href: '/dashboard/students',
      icon: Users,
    },
    {
      label: 'Competencies',
      href: '/dashboard/competencies',
      icon: BookOpen,
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen shadow-sm">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={120} 
              height={60}
              className="object-contain"
            />
         
        </div>
      </div>

      

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 h-11 px-3 rounded-lg transition-all duration-200 font-medium text-sm',
                isActive
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              )}
              onClick={() => router.push(item.href)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        {/* User Info */}
      {user && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate capitalize">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role}
              </p>
            </div>
          </div>
      )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 px-3 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium text-sm"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
