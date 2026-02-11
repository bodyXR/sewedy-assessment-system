'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Users, BookOpen, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()

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
    <div className="w-64 bg-primary text-primary-foreground flex flex-col h-screen">
      {/* Logo Area */}
      <div className="p-6 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary-foreground flex items-center justify-center">
            <span className="font-bold text-primary">SA</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">School Assessment</h2>
            <p className="text-xs text-primary-foreground/70">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 text-base font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
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
      <div className="p-4 border-t border-primary/20">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-base font-medium text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-lg"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
