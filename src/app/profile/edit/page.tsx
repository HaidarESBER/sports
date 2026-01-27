"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type ProfileData = {
  id: string
  email: string
  name: string | null
  image: string | null
  bio: string | null
  location: string | null
  isPublic: boolean
}

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const bioMaxLength = 500
  const bioLength = bio.length

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile")
        if (response.status === 401) {
          router.push("/login")
          return
        }
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setName(data.name || "")
          setBio(data.bio || "")
          setLocation(data.location || "")
          setIsPublic(data.isPublic)
        }
      } catch (err) {
        console.error("Error loading profile:", err)
        setError("Erreur lors du chargement du profil")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (bio.length > bioMaxLength) {
      setError(`La biographie ne doit pas depasser ${bioMaxLength} caracteres`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          bio: bio.trim() || null,
          location: location.trim() || null,
          isPublic,
        }),
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        router.push("/profile")
      } else {
        const data = await response.json()
        setError(data.error || "Erreur lors de la mise a jour")
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Profil non trouve</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour au profil
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Modifier le profil</h1>
          <p className="mt-1 text-sm text-gray-600">
            Mettez a jour vos informations personnelles
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nom
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre nom"
              />
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Biographie
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={bioMaxLength}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  bioLength > bioMaxLength ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Parlez de vous, de vos objectifs sportifs..."
              />
              <div className="mt-1 flex justify-end">
                <span
                  className={`text-xs ${
                    bioLength > bioMaxLength ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {bioLength}/{bioMaxLength}
                </span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Localisation
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Paris, France"
              />
            </div>

            {/* Visibility */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="isPublic"
                  className="text-sm font-medium text-gray-700"
                >
                  Profil public
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Les profils publics sont visibles par tous les utilisateurs.
                  Les profils prives ne sont visibles que par vous.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href="/profile"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || bioLength > bioMaxLength}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
