'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function CopyButton({ text, label = 'Copiar', className, size = 'default' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button
      variant={copied ? 'success' : 'outline'}
      size={size}
      onClick={handleCopy}
      className={cn('transition-all', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          ¡Copiado!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )
}
