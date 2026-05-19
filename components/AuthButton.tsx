'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { LogIn, LogOut, LayoutDashboard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <LayoutDashboard className="h-4 w-4" />
            Mis votaciones
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? 'User'}
              width={32}
              height={32}
              className="rounded-full border-2 border-gray-200"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-gray-500 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signIn('google')}
      className="flex items-center gap-2"
    >
      <LogIn className="h-4 w-4" />
      Entrar con Google
    </Button>
  )
}
