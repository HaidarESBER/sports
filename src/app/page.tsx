import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge, sportLabels } from "@/components/ui/Badge"

export default function Home() {
  const sports = ["running", "swimming", "cycling", "strength"]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium border border-white/30">
                🏃 Explorez sans limite
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 animate-fade-in">
              Planifiez, Partagez,{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Progressez
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              La plateforme de planification sportive qui vous aide à créer des
              séances personnalisées, suivre votre progression et partager vos
              entraînements avec la communauté.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  Commencer gratuitement
                </Button>
              </Link>
              <Link href="/discover">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Découvrir en mode démo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir SportPlan ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour transformer votre pratique sportive
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="interactive" className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <svg
                    className="w-10 h-10 text-blue-600"
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Séances personnalisées
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Créez des séances d&apos;entraînement sur mesure avec des
                exercices détaillés, des séries, répétitions et durées
                personnalisées.
              </p>
            </Card>

            <Card variant="interactive" className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <svg
                    className="w-10 h-10 text-green-600"
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Programmes structurés
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Organisez vos séances en programmes multi-semaines avec un
                planning hebdomadaire pour atteindre vos objectifs.
              </p>
            </Card>

            <Card variant="interactive" className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <svg
                    className="w-10 h-10 text-orange-600"
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Suivi de progression
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Enregistrez vos entraînements, visualisez vos statistiques et
                suivez votre évolution avec des graphiques et des records
                personnels.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sports supportés
            </h2>
            <p className="text-xl text-gray-600">
              Adapté à tous les types d&apos;entraînements
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sports.map((sport, index) => (
              <Card 
                key={sport} 
                variant="interactive" 
                className="text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4">
                  <Badge sport={sport} size="lg" />
                </div>
                <p className="text-sm font-medium text-gray-700 mt-2">
                  {sportLabels[sport] || sport}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Rejoignez la communauté SportPlan
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Commencez dès aujourd&apos;hui à planifier vos entraînements et à
            partager vos progrès avec d&apos;autres sportifs passionnés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Créer un compte gratuit
              </Button>
            </Link>
            <Link href="/discover">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Essayer en mode démo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
