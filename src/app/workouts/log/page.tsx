"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const sportOptions = [
  { value: "running", label: "Course" },
  { value: "swimming", label: "Natation" },
  { value: "cycling", label: "Cyclisme" },
  { value: "strength", label: "Musculation" },
  { value: "other", label: "Autre" },
]

type Session = {
  id: string
  name: string
  sport: string
  exercises: Array<{
    exerciseId: string
    exercise: {
      id: string
      name: string
    }
    sets: number | null
    reps: number | null
    duration: number | null
    distance: number | null
  }>
}

type Exercise = {
  id: string
  name: string
  sport: string
}

type WorkoutExercise = {
  exerciseId: string
  exerciseName: string
  order: number
  plannedSets: number | null
  plannedReps: number | null
  actualSets: number | null
  actualReps: string
  weight: number | null
  duration: number | null
  distance: number | null
  notes: string
}

export default function LogWorkoutPage() {
  const router = useRouter()
  const [selectedSessionId, setSelectedSessionId] = useState("")
  const [sessions, setSessions] = useState<Session[]>([])
  const [name, setName] = useState("")
  const [sport, setSport] = useState("")
  const [completedAt, setCompletedAt] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [duration, setDuration] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState("")
  const [exerciseResults, setExerciseResults] = useState<Exercise[]>([])
  const [showExerciseResults, setShowExerciseResults] = useState(false)

  // Fetch user's sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch("/api/sessions")
        if (response.ok) {
          const data: Session[] = await response.json()
          setSessions(data)
        }
      } catch (error) {
        console.error("Error fetching sessions:", error)
      }
    }
    fetchSessions()
  }, [])

  // When session selected, auto-fill
  useEffect(() => {
    if (selectedSessionId) {
      const session = sessions.find((s) => s.id === selectedSessionId)
      if (session) {
        setName(session.name)
        setSport(session.sport)
        setExercises(
          session.exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exercise.name,
            order: index,
            plannedSets: ex.sets,
            plannedReps: ex.reps,
            actualSets: null,
            actualReps: "",
            weight: null,
            duration: ex.duration,
            distance: ex.distance,
            notes: "",
          }))
        )
      }
    } else {
      setName("")
      setSport("")
      setExercises([])
    }
  }, [selectedSessionId, sessions])

  // Search exercises
  useEffect(() => {
    if (!exerciseSearch.trim()) {
      setExerciseResults([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams()
        params.set("search", exerciseSearch)
        if (sport) {
          params.set("sport", sport)
        }

        const response = await fetch(`/api/exercises?${params.toString()}`)
        if (response.ok) {
          const data: Exercise[] = await response.json()
          setExerciseResults(data)
          setShowExerciseResults(true)
        }
      } catch (error) {
        console.error("Error searching exercises:", error)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [exerciseSearch, sport])

  function addExercise(exercise: Exercise) {
    const alreadyAdded = exercises.some((e) => e.exerciseId === exercise.id)
    if (alreadyAdded) return

    setExercises([
      ...exercises,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        order: exercises.length,
        plannedSets: null,
        plannedReps: null,
        actualSets: null,
        actualReps: "",
        weight: null,
        duration: null,
        distance: null,
        notes: "",
      },
    ])
    setExerciseSearch("")
    setShowExerciseResults(false)
  }

  function removeExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, order: i })))
  }

  function updateExercise(index: number, updates: Partial<WorkoutExercise>) {
    const updated = [...exercises]
    updated[index] = { ...updated[index], ...updates }
    setExercises(updated)
  }

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
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId || undefined,
          name: name.trim(),
          sport,
          completedAt: new Date(completedAt).toISOString(),
          duration: duration ? parseInt(duration) : undefined,
          rating: rating || undefined,
          notes: notes.trim() || undefined,
          exercises: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            plannedSets: ex.plannedSets || undefined,
            plannedReps: ex.plannedReps || undefined,
            actualSets: ex.actualSets || undefined,
            actualReps: ex.actualReps || undefined,
            weight: ex.weight || undefined,
            duration: ex.duration || undefined,
            distance: ex.distance || undefined,
            notes: ex.notes.trim() || undefined,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de l'enregistrement")
      }

      const workout = await response.json()
      router.push(`/workouts/${workout.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/workouts"
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
            Retour à l&apos;historique
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Enregistrer un entraînement
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Enregistrez un entraînement manuellement ou depuis une séance modèle
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Session selector */}
          <div className="bg-white shadow rounded-lg p-6">
            <label
              htmlFor="session"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Séance modèle (optionnel)
            </label>
            <select
              id="session"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Aucune (entrée manuelle)</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} ({session.sport})
                </option>
              ))}
            </select>
          </div>

          {/* Basic info */}
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nom de l&apos;entraînement *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Séance jambes, Course 5km"
              />
            </div>

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
                <option value="">Sélectionnez un sport</option>
                {sportOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="completedAt"
                className="block text-sm font-medium text-gray-700"
              >
                Date et heure
              </label>
              <input
                type="datetime-local"
                id="completedAt"
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-gray-700"
                >
                  Note (1-5)
                </label>
                <input
                  type="number"
                  id="rating"
                  value={rating || ""}
                  onChange={(e) =>
                    setRating(e.target.value ? parseInt(e.target.value) : null)
                  }
                  min="1"
                  max="5"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Commentaires sur l'entraînement..."
              />
            </div>
          </div>

          {/* Exercises */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Exercices
            </h2>

            {/* Exercise search */}
            <div className="relative mb-4">
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                onFocus={() => setShowExerciseResults(true)}
                placeholder="Rechercher un exercice..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {showExerciseResults && exerciseResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {exerciseResults.map((exercise) => {
                    const isSelected = exercises.some(
                      (e) => e.exerciseId === exercise.id
                    )
                    return (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => addExercise(exercise)}
                        disabled={isSelected}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                          isSelected ? "bg-gray-50 text-gray-400" : ""
                        }`}
                      >
                        {exercise.name}
                        {isSelected && (
                          <span className="ml-2 text-green-600">Ajouté</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Exercise list */}
            {exercises.length > 0 && (
              <div className="space-y-4">
                {exercises.map((ex, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {ex.exerciseName}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>

                    {(ex.plannedSets || ex.plannedReps) && (
                      <div className="mb-3 text-sm text-gray-600">
                        <p>
                          Prévu: {ex.plannedSets && `${ex.plannedSets} séries`}
                          {ex.plannedSets && ex.plannedReps && " × "}
                          {ex.plannedReps && `${ex.plannedReps} répétitions`}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Séries réalisées
                        </label>
                        <input
                          type="number"
                          value={ex.actualSets || ""}
                          onChange={(e) =>
                            updateExercise(index, {
                              actualSets: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          min="0"
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Répétitions (ex: 10,10,8)
                        </label>
                        <input
                          type="text"
                          value={ex.actualReps}
                          onChange={(e) =>
                            updateExercise(index, { actualReps: e.target.value })
                          }
                          placeholder="10,10,8"
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Poids (kg)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={ex.weight || ""}
                          onChange={(e) =>
                            updateExercise(index, {
                              weight: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          min="0"
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Durée (s)
                        </label>
                        <input
                          type="number"
                          value={ex.duration || ""}
                          onChange={(e) =>
                            updateExercise(index, {
                              duration: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          min="0"
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Distance (m)
                        </label>
                        <input
                          type="number"
                          value={ex.distance || ""}
                          onChange={(e) =>
                            updateExercise(index, {
                              distance: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          min="0"
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs text-gray-600 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={ex.notes}
                        onChange={(e) =>
                          updateExercise(index, { notes: e.target.value })
                        }
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href="/workouts"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer l'entraînement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

