'use client'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  useEffect(() => {
    if (status === 'loading') return
    if (session) router.replace('/dashboard')
    else router.replace('/auth/login')
  }, [session, status, router])
  return <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">Loading...</div>
}
