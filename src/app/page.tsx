import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge, sportLabels } from "@/components/ui/Badge"

export default function Home() {
  const sports = ["running", "swimming", "cycling", "strength"]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Planifiez, Partagez,{" "}
              <span className="text-primary-600">Progressez</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              La plateforme de planification sportive qui vous aide à créer des
              séances personnalisées, suivre votre progression et partager vos
              entraînements avec la communauté.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Commencer gratuitement
                </Button>
              </Link>
              <Link href="/discover">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Découvrir
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir SportPlan ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="interactive" className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Séances personnalisées
              </h3>
              <p className="text-gray-600">
                Créez des séances d&apos;entraînement sur mesure avec des
                exercices détaillés, des séries, répétitions et durées
                personnalisées.
              </p>
            </Card>

            <Card variant="interactive" className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-secondary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Programmes structurés
              </h3>
              <p className="text-gray-600">
                Organisez vos séances en programmes multi-semaines avec un
                planning hebdomadaire pour atteindre vos objectifs.
              </p>
            </Card>

            <Card variant="interactive" className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-accent-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Suivi de progression
              </h3>
              <p className="text-gray-600">
                Enregistrez vos entraînements, visualisez vos statistiques et
                suivez votre évolution avec des graphiques et des records
                personnels.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Sports supportés
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sports.map((sport) => (
              <Card key={sport} variant="interactive" className="text-center">
                <div className="mb-4">
                  <Badge sport={sport} size="lg" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {sportLabels[sport] || sport}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Rejoignez la communauté SportPlan
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Commencez dès aujourd&apos;hui à planifier vos entraînements et à
            partager vos progrès avec d&apos;autres sportifs passionnés.
          </p>
          <Link href="/register">
            <Button variant="secondary" size="lg">
              Créer un compte gratuit
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
