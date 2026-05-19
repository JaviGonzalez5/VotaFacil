import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PollForm } from '@/components/PollForm'

export const metadata = {
  title: 'Crear votación — VotaFácil',
}

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            VotaFácil
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nueva votación</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Rellena el formulario y comparte el enlace con tu grupo.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <PollForm />
        </div>
      </main>
    </div>
  )
}
