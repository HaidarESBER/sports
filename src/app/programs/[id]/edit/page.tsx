"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  SessionScheduler,
  ScheduledSession,
  AvailableSession,
} from "@/components/SessionScheduler"

const sportOptions = [
  { value: "running", label: "Course" },
  { value: "swimming", label: "Natation" },
  { value: "cycling", label: "Cyclisme" },
  { value: "strength", label: "Musculation" },
  { value: "other", label: "Autre" },
]

const difficultyOptions = [
  { value: "", label: "Selectionnez un niveau" },
  { value: "debutant", label: "Debutant" },
  { value: "intermediaire", label: "Intermediaire" },
  { value: "avance", label: "Avance" },
]

type ProgramSession = {
  id: string
  sessionId: string
  weekNumber: number
  dayOfWeek: number
  order: number
  session: {
    id: string
    name: string
    sport: string
  }
}

type Program = {
  id: string
  name: string
  description: string | null
  sport: string
  durationWeeks: number
  difficulty: string | null
  isPublic: boolean
  programSessions: ProgramSession[]
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditProgramPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sport, setSport] = useState("")
  const [durationWeeks, setDurationWeeks] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>(
    []
  )
  const [availableSessions, setAvailableSessions] = useState<AvailableSession[]>(
    []
  )
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load program and sessions
  useEffect(() => {
    async function loadData() {
      try {
        // Load program
        const programResponse = await fetch(`/api/programs/${id}`)
        if (!programResponse.ok) {
          if (
            programResponse.status === 404 ||
            programResponse.status === 403
          ) {
            router.push("/programs")
            return
          }
          throw new Error("Failed to load program")
        }

        const program: Program = await programResponse.json()
        setName(program.name)
        setDescription(program.description || "")
        setSport(program.sport)
        setDurationWeeks(program.durationWeeks.toString())
        setDifficulty(program.difficulty || "")
        setIsPublic(program.isPublic)
        setScheduledSessions(
          program.programSessions.map((ps) => ({
            sessionId: ps.sessionId,
            sessionName: ps.session.name,
            weekNumber: ps.weekNumber,
            dayOfWeek: ps.dayOfWeek,
            order: ps.order,
          }))
        )

        // Load user's sessions
        const sessionsResponse = await fetch("/api/sessions")
        if (sessionsResponse.ok) {
          const sessions = await sessionsResponse.json()
          setAvailableSessions(
            sessions.map((s: { id: string; name: string; sport: string }) => ({
              id: s.id,
              name: s.name,
              sport: s.sport,
            }))
          )
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Erreur lors du chargement du programme")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Le nom est requis")
      return
    }

    if (!sport) {
      setError("Le sport est requis")
      return
    }

    const weeks = parseInt(durationWeeks)
    if (isNaN(weeks) || weeks < 1 || weeks > 52) {
      setError("La duree doit etre entre 1 et 52 semaines")
      return
    }

    setIsSubmitting(true)

    try {
      // Update the program
      const programResponse = await fetch(`/api/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          sport,
          durationWeeks: weeks,
          difficulty: difficulty || null,
          isPublic,
        }),
      })

      if (!programResponse.ok) {
        const data = await programResponse.json()
        throw new Error(data.error || "Erreur lors de la mise a jour")
      }

      // Update scheduled sessions
      const sessionsResponse = await fetch(`/api/programs/${id}/sessions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessions: scheduledSessions.map((s) => ({
            sessionId: s.sessionId,
            weekNumber: s.weekNumber,
            dayOfWeek: s.dayOfWeek,
            order: s.order,
          })),
        }),
      })

      if (!sessionsResponse.ok) {
        console.error("Failed to update sessions")
      }

      router.push(`/programs/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/programs/${id}`}
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
            Retour au programme
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Modifier le programme
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nom du programme *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Programme 5k debutant, Preparation marathon"
              />
            </div>

            {/* Sport */}
            <div>
              <label
                htmlFor="sport"
                className="block text-sm font-medium text-gray-700"
              >
                Sport *
              </label>
              <select
                id="sport"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selectionnez un sport</option>
                {sportOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Decrivez l'objectif et le contenu du programme..."
              />
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="durationWeeks"
                className="block text-sm font-medium text-gray-700"
              >
                Duree (semaines) *
              </label>
              <input
                type="number"
                id="durationWeeks"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                min="1"
                max="52"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 8"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-700"
              >
                Niveau de difficulte
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Public checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isPublic"
                className="ml-2 block text-sm text-gray-700"
              >
                Rendre ce programme public (visible par tous)
              </label>
            </div>
          </div>

          {/* Session Scheduler */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Planification des seances
            </h2>
            {availableSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Vous n&apos;avez pas encore de seances.
                </p>
                <Link
                  href="/sessions/new"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Creer une seance
                </Link>
              </div>
            ) : (
              <SessionScheduler
                durationWeeks={parseInt(durationWeeks) || 0}
                scheduledSessions={scheduledSessions}
                onScheduleChange={setScheduledSessions}
                availableSessions={availableSessions}
                programSport={sport || undefined}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/programs/${id}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
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
