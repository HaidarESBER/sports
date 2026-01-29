import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Abstract gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[600px]">
          {/* Curved gradient lines effect */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Multiple curved lines for depth */}
              {[...Array(20)].map((_, i) => (
                <path
                  key={i}
                  d={`M 0 ${300 + i * 15} Q 600 ${250 + i * 15} 1200 ${300 + i * 15}`}
                  stroke="url(#grad1)"
                  strokeWidth="2"
                  fill="none"
                  opacity={0.4 - i * 0.02}
                />
              ))}
            </svg>
          </div>
          {/* Glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-semibold">SportPlan</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/discover" className="text-sm text-gray-400 hover:text-white transition-colors">
              Découvrir
            </Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Tarifs
            </Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Connexion
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/register">
              <Button 
                variant="primary"
                size="sm"
                className="bg-white text-black hover:bg-gray-100"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Commencer
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Main content */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                </div>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold">
                  SportPlan
                </h1>
              </div>
              
              <p className="text-xl sm:text-2xl text-gray-300 max-w-xl leading-relaxed">
                SportPlan est un compagnon de planification sportive qui comprend vos objectifs, votre progression et vos préférences pour créer des entraînements personnalisés.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button 
                    variant="primary"
                    size="lg"
                    className="bg-white text-black hover:bg-gray-100 font-medium px-8"
                  >
                    Commencer gratuitement
                  </Button>
                </Link>
                <Link href="/discover">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-gray-700 text-white hover:bg-gray-900 font-medium px-8"
                  >
                    Explorer
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Navigation links */}
            <div className="hidden lg:block">
              <div className="space-y-12">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
                    Menu
                  </h3>
                  <nav className="space-y-3">
                    <Link href="/discover" className="block text-white hover:text-gray-300 transition-colors">
                      Découvrir
                    </Link>
                    <Link href="/programs" className="block text-white hover:text-gray-300 transition-colors">
                      Programmes
                    </Link>
                    <Link href="/sessions" className="block text-white hover:text-gray-300 transition-colors">
                      Séances
                    </Link>
                    <Link href="/progress" className="block text-white hover:text-gray-300 transition-colors">
                      Progression
                    </Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
                    Réseaux
                  </h3>
                  <nav className="space-y-3">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="block text-white hover:text-gray-300 transition-colors">
                      X
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="block text-white hover:text-gray-300 transition-colors">
                      LinkedIn
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="block text-white hover:text-gray-300 transition-colors">
                      GitHub
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SportPlan. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">
                Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
