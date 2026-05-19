'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle2, ExternalLink, Lock, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CopyButton } from '@/components/CopyButton'
import { getShareUrl, getAdminUrl } from '@/lib/utils'

function SuccessContent() {
  const params = useSearchParams()
  const publicId = params.get('publicId') ?? ''
  const token = params.get('token') ?? ''

  const shareUrl = getShareUrl(publicId)
  const adminUrl = getAdminUrl(publicId, token)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        {/* Success icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">¡Votación creada!</h1>
          <p className="text-gray-500 text-sm">
            Comparte el enlace con tu grupo para que voten.
          </p>
        </div>

        {/* Share link */}
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">Enlace público para compartir</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg border border-indigo-200 px-3 py-2">
              <span className="flex-1 truncate text-sm text-gray-700 font-mono">{shareUrl}</span>
            </div>
            <div className="flex gap-2">
              <CopyButton text={shareUrl} label="Copiar enlace" className="flex-1" />
              <Link href={`/p/${publicId}`} target="_blank">
                <Button variant="outline" size="default">
                  <ExternalLink className="h-4 w-4" />
                  Abrir
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Admin link */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">Tu enlace de administración</span>
            </div>
            <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
              ⚠️ Guarda este enlace. Es el único modo de gestionar la votación. No lo compartas con otros.
            </p>
            <div className="flex items-center gap-2 bg-white rounded-lg border border-amber-200 px-3 py-2">
              <span className="flex-1 truncate text-xs text-gray-600 font-mono">{adminUrl}</span>
            </div>
            <div className="flex gap-2">
              <CopyButton text={adminUrl} label="Copiar enlace admin" className="flex-1" />
              <Link href={`/admin/${publicId}?token=${token}`}>
                <Button variant="outline" size="default">
                  <ExternalLink className="h-4 w-4" />
                  Gestionar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Link href="/" className="block">
          <Button variant="ghost" className="w-full text-gray-500">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
