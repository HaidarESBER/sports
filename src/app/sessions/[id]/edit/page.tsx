"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ExerciseSelector, SessionExerciseInput } from "@/components/ExerciseSelector"

const sportOptions = [
  { value: "running", label: "Course" },
  { value: "swimming", label: "Natation" },
  { value: "cycling", label: "Cyclisme" },
  { value: "strength", label: "Musculation" },
  { value: "other", label: "Autre" },
]

type SessionExercise = {
  id: string
  exerciseId: string
  order: number
  sets: number | null
  reps: number | null
  duration: number | null
  distance: number | null
  intensity: string | null
  notes: string | null
  exercise: {
    id: string
    name: string
    sport: string
  }
}

type Session = {
  id: string
  name: string
  description: string | null
  sport: string
  estimatedDuration: number | null
  exercises: SessionExercise[]
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditSessionPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sport, setSport] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [exercises, setExercises] = useState<SessionExerciseInput[]>([])
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch(`/api/sessions/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/sessions")
            return
          }
          if (response.status === 403) {
            router.push("/sessions")
            return
          }
          throw new Error("Failed to load session")
        }

        const session: Session = await response.json()
        setName(session.name)
        setDescription(session.description || "")
        setSport(session.sport)
        setEstimatedDuration(
          session.estimatedDuration?.toString() || ""
        )
        setExercises(
          session.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exercise.name,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            duration: ex.duration,
            distance: ex.distance,
            intensity: ex.intensity,
            notes: ex.notes,
          }))
        )
      } catch (err) {
        console.error("Error loading session:", err)
        setError("Erreur lors du chargement de la seance")
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
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

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          sport,
          estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
          exercises: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            duration: ex.duration,
            distance: ex.distance,
            intensity: ex.intensity,
            notes: ex.notes,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la mise a jour")
      }

      router.push(`/sessions/${id}`)
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/sessions/${id}`}
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
            Retour a la seance
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Modifier la seance</h1>
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
                Nom de la seance *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Seance jambes, Course 5km tempo"
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
                placeholder="Description de la seance..."
              />
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duree estimee (minutes)
              </label>
              <input
                type="number"
                id="duration"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 45"
              />
            </div>
          </div>

          {/* Exercises */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Exercices
            </h2>
            <ExerciseSelector
              selectedExercises={exercises}
              onExercisesChange={setExercises}
              sport={sport || undefined}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/sessions/${id}`}
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
