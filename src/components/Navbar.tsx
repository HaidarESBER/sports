"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

type User = {
  id: string
  name: string | null
  image: string | null
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          setUser({ id: data.id, name: data.name, image: data.image })
        }
      } catch (error) {
        // Not logged in
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  async function handleSignOut() {
    await signOut({ redirect: false })
    setUser(null)
    router.push("/")
    router.refresh()
  }

  function getInitial(name: string | null): string {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  function isActive(path: string): boolean {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  const navLinks = [
    { href: "/discover", label: "Découvrir" },
    { href: "/sessions", label: "Mes Séances" },
    { href: "/programs", label: "Mes Programmes" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">SportPlan</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium transition-default ${
                  isActive(link.href)
                    ? "text-white border-b-2 border-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : user ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 focus-ring rounded-full"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                        {getInitial(user.name)}
                      </div>
                    )}
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg border border-gray-800 py-1 z-20">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Profil
                        </Link>
                        <Link
                          href="/feed"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Mon Feed
                        </Link>
                        <Link
                          href="/progress"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Progression
                        </Link>
                        <hr className="my-1 border-gray-800" />
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus-ring"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showMobileMenu ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              <>
                <div className="hidden md:flex md:items-center md:gap-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-default"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-gray-100 transition-default"
                  >
                    Inscription
                  </Link>
                </div>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus-ring"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-900 py-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    isActive(link.href)
                      ? "bg-gray-900 text-white"
                      : "text-gray-400 hover:bg-gray-900 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-900 hover:text-white rounded-md"
                  >
                    Profil
                  </Link>
                  <Link
                    href="/feed"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-900 hover:text-white rounded-md"
                  >
                    Mon Feed
                  </Link>
                  <Link
                    href="/progress"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-900 hover:text-white rounded-md"
                  >
                    Progression
                  </Link>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      handleSignOut()
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-gray-900 hover:text-red-300 rounded-md"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-900 hover:text-white rounded-md"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-3 py-2 text-base font-medium text-black bg-white rounded-md hover:bg-gray-100 text-center"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

