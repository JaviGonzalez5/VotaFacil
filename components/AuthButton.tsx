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
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? 'User'}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <LayoutDashboard className="h-4 w-4" />
            )}
            <span>Mis votaciones</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-gray-500 hover:text-red-600 px-2"
        >
          <LogOut className="h-4 w-4" />
        </Button>
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
      <span>Entrar con Google</span>
    </Button>
  )
}
