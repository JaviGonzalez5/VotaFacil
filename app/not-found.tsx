import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-6xl">🗳️</div>
        <h1 className="text-2xl font-bold text-gray-900">Página no encontrada</h1>
        <p className="text-gray-500 text-sm">
          La página que buscas no existe o ha sido eliminada.
        </p>
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  )
}
