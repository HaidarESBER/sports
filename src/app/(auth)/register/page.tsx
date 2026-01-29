"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/Toast"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function RegisterPage() {
  const router = useRouter()
  const toast = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  async function checkEmailExists(emailToCheck: string) {
    if (!emailToCheck || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToCheck)) {
      setEmailError("")
      return
    }

    setIsCheckingEmail(true)
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(emailToCheck)}`)
      const data = await response.json()
      
      if (data.exists) {
        setEmailError("Un compte existe déjà avec cet email")
      } else {
        setEmailError("")
      }
    } catch {
      // Silently fail - we'll check on submit
    } finally {
      setIsCheckingEmail(false)
    }
  }

  function validateForm(): string | null {
    if (!email) {
      return "L'email est requis"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Format d'email invalide"
    }

    if (emailError) {
      return emailError
    }

    if (!password) {
      return "Le mot de passe est requis"
    }

    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères"
    }

    if (password !== confirmPassword) {
      return "Les mots de passe ne correspondent pas"
    }

    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setEmailError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setEmailError(data.error || "Un compte existe déjà avec cet email")
          toast.showToast(data.error || "Un compte existe déjà avec cet email", "error")
        } else {
          setError(data.error || "Erreur lors de l'inscription")
          toast.showToast(data.error || "Erreur lors de l'inscription", "error")
        }
        return
      }

      toast.showToast("Compte créé avec succès !", "success")
      // Redirect to login with success message
      router.push("/login?registered=true")
    } catch {
      const errorMsg = "Une erreur est survenue. Veuillez réessayer."
      setError(errorMsg)
      toast.showToast(errorMsg, "error")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOAuthSignUp(provider: "google" | "github") {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: "/dashboard" })
  }

  return (
    <>
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
          Créer votre compte
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Rejoignez la communauté SportPlan
        </p>
        <p className="text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Se connecter
          </Link>
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom (optionnel)
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError("")
                }}
                onBlur={(e) => checkEmailExists(e.target.value)}
                placeholder="vous@exemple.com"
                className={emailError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {isCheckingEmail && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            {emailError && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
            />
            {password && password.length < 8 && (
              <p className="mt-1 text-xs text-gray-500">
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre mot de passe"
              className={confirmPassword && password !== confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>
        </div>

        <div>
          <Button
            type="submit"
            disabled={isLoading || !!emailError}
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            Créer mon compte
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or sign up with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuthSignUp("google")}
            disabled={isLoading}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="ml-2">Google</span>
          </button>

          <button
            onClick={() => handleOAuthSignUp("github")}
            disabled={isLoading}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="ml-2">GitHub</span>
          </button>
        </div>
      </div>
    </>
  )
}
