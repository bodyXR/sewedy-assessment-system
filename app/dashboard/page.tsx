'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard/students')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  )
}
