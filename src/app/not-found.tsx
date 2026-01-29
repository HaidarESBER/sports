import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page non trouvée
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg">Retour à l&apos;accueil</Button>
          </Link>
          <Link href="/discover">
            <Button variant="outline" size="lg">
              Découvrir
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

