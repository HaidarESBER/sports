"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const sportColors: Record<string, { bg: string; text: string }> = {
  running: { bg: "bg-green-100", text: "text-green-800" },
  swimming: { bg: "bg-blue-100", text: "text-blue-800" },
  cycling: { bg: "bg-yellow-100", text: "text-yellow-800" },
  strength: { bg: "bg-red-100", text: "text-red-800" },
  other: { bg: "bg-gray-100", text: "text-gray-800" },
}

const sportLabels: Record<string, string> = {
  running: "Course",
  swimming: "Natation",
  cycling: "Cyclisme",
  strength: "Musculation",
  other: "Autre",
}

type WorkoutExercise = {
  id: string
  exerciseId: string
  order: number
  plannedSets: number | null
  plannedReps: number | null
  actualSets: number | null
  actualReps: string | null
  weight: number | null
  duration: number | null
  distance: number | null
  notes: string | null
  exercise: {
    id: string
    name: string
  }
}

type Workout = {
  id: string
  name: string
  sport: string
  completedAt: string
  duration: number | null
  notes: string | null
  rating: number | null
  session: {
    id: string
    name: string
  } | null
  program: {
    id: string
    name: string
  } | null
  exercises: WorkoutExercise[]
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default function WorkoutDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!id) return

    async function fetchWorkout() {
      try {
        const response = await fetch(`/api/workouts/${id}`)
        if (response.ok) {
          const data: Workout = await response.json()
          setWorkout(data)
        } else if (response.status === 404) {
          router.push("/workouts")
        }
      } catch (error) {
        console.error("Error fetching workout:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkout()
  }, [id, router])

  async function handleDelete() {
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/workouts")
      } else {
        console.error("Failed to delete workout")
      }
    } catch (error) {
      console.error("Error deleting workout:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return null
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!workout) {
    return null
  }

  const sportColor = sportColors[workout.sport] || sportColors.other
  const sportLabel = sportLabels[workout.sport] || workout.sport

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/workouts"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
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
          Retour à l&apos;historique
        </Link>

        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{workout.name}</h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sportColor.bg} ${sportColor.text}`}
                >
                  {sportLabel}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <span>{formatDate(workout.completedAt)}</span>
                {workout.duration && <span>{workout.duration} minutes</span>}
                {workout.rating && (
                  <div className="flex items-center">{renderStars(workout.rating)}</div>
                )}
              </div>

              {workout.session && (
                <Link
                  href={`/sessions/${workout.session.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
                >
                  Séance modèle: {workout.session.name} →
                </Link>
              )}

              {workout.notes && (
                <p className="text-gray-600 mt-4">{workout.notes}</p>
              )}
            </div>

            <div className="mt-4 sm:mt-0 flex gap-2">
              {showDeleteConfirm ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? "..." : "Confirmer"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Exercices ({workout.exercises.length})
          </h2>
          <div className="space-y-4">
            {workout.exercises.map((ex, index) => {
              const hasPlanned = ex.plannedSets !== null || ex.plannedReps !== null
              const hasActual = ex.actualSets !== null || ex.actualReps !== null

              return (
                <div
                  key={ex.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {index + 1}. {ex.exercise.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {hasPlanned && (
                      <div>
                        <p className="text-gray-500 mb-1">Prévu:</p>
                        <div className="text-gray-700">
                          {ex.plannedSets && <span>{ex.plannedSets} séries</span>}
                          {ex.plannedSets && ex.plannedReps && <span> × </span>}
                          {ex.plannedReps && <span>{ex.plannedReps} répétitions</span>}
                        </div>
                      </div>
                    )}
                    {hasActual && (
                      <div>
                        <p className="text-gray-500 mb-1">Réalisé:</p>
                        <div className="text-gray-700">
                          {ex.actualSets && <span>{ex.actualSets} séries</span>}
                          {ex.actualSets && ex.actualReps && <span> × </span>}
                          {ex.actualReps && (
                            <span>
                              {(() => {
                                try {
                                  const reps = JSON.parse(ex.actualReps)
                                  if (Array.isArray(reps)) {
                                    return reps.join(", ")
                                  }
                                  return ex.actualReps
                                } catch {
                                  return ex.actualReps
                                }
                              })()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {ex.weight && (
                      <div>
                        <p className="text-gray-500 mb-1">Poids:</p>
                        <p className="text-gray-700">{ex.weight} kg</p>
                      </div>
                    )}
                    {ex.duration && (
                      <div>
                        <p className="text-gray-500 mb-1">Durée:</p>
                        <p className="text-gray-700">{ex.duration} s</p>
                      </div>
                    )}
                    {ex.distance && (
                      <div>
                        <p className="text-gray-500 mb-1">Distance:</p>
                        <p className="text-gray-700">{ex.distance} m</p>
                      </div>
                    )}
                  </div>
                  {ex.notes && (
                    <p className="text-sm text-gray-600 mt-2">{ex.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

