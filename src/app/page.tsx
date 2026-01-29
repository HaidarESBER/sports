import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        {/* Gradient orbs - subtle */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32">
          <div className="max-w-4xl">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-xs font-medium text-gray-400 border border-gray-800 rounded-full bg-gray-900/50 backdrop-blur-sm">
                Plateforme de planification sportive
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Planifiez vos
              <br />
              <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                entraînements
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
              Créez des séances personnalisées, suivez votre progression et partagez vos programmes avec une communauté de sportifs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button 
                  variant="primary"
                  size="lg" 
                  className="font-medium"
                >
                  Commencer
                </Button>
              </Link>
              <Link href="/discover">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="font-medium"
                >
                  Explorer
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-gray-700 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-500 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-gray-950 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Fonctionnalités
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              Tout ce dont vous avez besoin pour optimiser votre pratique sportive
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group">
              <div className="p-8 border border-gray-900 rounded-lg bg-gray-900/30 hover:bg-gray-900/50 hover:border-gray-800 transition-all duration-300">
                <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Séances personnalisées
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Créez des séances d&apos;entraînement détaillées avec exercices, séries, répétitions et durées personnalisées.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="p-8 border border-gray-900 rounded-lg bg-gray-900/30 hover:bg-gray-900/50 hover:border-gray-800 transition-all duration-300">
                <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Programmes structurés
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Organisez vos séances en programmes multi-semaines avec un planning hebdomadaire.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="p-8 border border-gray-900 rounded-lg bg-gray-900/30 hover:bg-gray-900/50 hover:border-gray-800 transition-all duration-300">
                <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Suivi de progression
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Enregistrez vos entraînements et visualisez vos statistiques avec des graphiques détaillés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 bg-black border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                100+
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Exercices
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                50+
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Programmes
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                200+
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Utilisateurs
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Disponible
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gray-950 border-t border-gray-900">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Rejoignez la communauté et commencez à planifier vos entraînements dès aujourd&apos;hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                variant="primary"
                size="lg" 
                className="font-medium"
              >
                Créer un compte
              </Button>
            </Link>
            <Link href="/discover">
              <Button 
                variant="outline" 
                size="lg" 
                className="font-medium"
              >
                Mode démo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
