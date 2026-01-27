"use client"

import { useState, useEffect, useCallback } from "react"

type Exercise = {
  id: string
  name: string
  description: string | null
  sport: string
}

export type SessionExerciseInput = {
  exerciseId: string
  exerciseName: string
  order: number
  sets: number | null
  reps: number | null
  duration: number | null
  distance: number | null
  intensity: string | null
  notes: string | null
}

type ExerciseSelectorProps = {
  selectedExercises: SessionExerciseInput[]
  onExercisesChange: (exercises: SessionExerciseInput[]) => void
  sport?: string
}

const intensityOptions = [
  { value: "easy", label: "Facile" },
  { value: "moderate", label: "Modere" },
  { value: "hard", label: "Difficile" },
  { value: "max", label: "Maximum" },
]

export function ExerciseSelector({
  selectedExercises,
  onExercisesChange,
  sport,
}: ExerciseSelectorProps) {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const searchExercises = useCallback(async (query: string, sportFilter?: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("search", query)
      if (sportFilter) {
        params.set("sport", sportFilter)
      }

      const response = await fetch(`/api/exercises?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Error searching exercises:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchExercises(search, sport)
    }, 300)

    return () => clearTimeout(debounce)
  }, [search, sport, searchExercises])

  function addExercise(exercise: Exercise) {
    const alreadySelected = selectedExercises.some(
      (e) => e.exerciseId === exercise.id
    )
    if (alreadySelected) return

    const newExercise: SessionExerciseInput = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      order: selectedExercises.length,
      sets: null,
      reps: null,
      duration: null,
      distance: null,
      intensity: null,
      notes: null,
    }

    onExercisesChange([...selectedExercises, newExercise])
    setSearch("")
    setResults([])
    setShowResults(false)
  }

  function removeExercise(index: number) {
    const updated = selectedExercises.filter((_, i) => i !== index)
    // Reorder
    const reordered = updated.map((ex, i) => ({ ...ex, order: i }))
    onExercisesChange(reordered)
  }

  function updateExercise(
    index: number,
    field: keyof SessionExerciseInput,
    value: string | number | null
  ) {
    const updated = [...selectedExercises]
    updated[index] = { ...updated[index], [field]: value }
    onExercisesChange(updated)
  }

  function moveExercise(index: number, direction: "up" | "down") {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === selectedExercises.length - 1) return

    const updated = [...selectedExercises]
    const newIndex = direction === "up" ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]

    // Reorder
    const reordered = updated.map((ex, i) => ({ ...ex, order: i }))
    onExercisesChange(reordered)
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ajouter des exercices
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Rechercher un exercice..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Search results dropdown */}
        {showResults && (search.trim() || results.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Recherche...</div>
            ) : results.length === 0 && search.trim() ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                Aucun exercice trouve
              </div>
            ) : (
              results.map((exercise) => {
                const isSelected = selectedExercises.some(
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
                    <span className="font-medium">{exercise.name}</span>
                    <span className="ml-2 text-gray-500 text-xs">
                      ({exercise.sport})
                    </span>
                    {isSelected && (
                      <span className="ml-2 text-green-600">Ajoute</span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowResults(false)}
        />
      )}

      {/* Selected exercises list */}
      {selectedExercises.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Exercices selectionnes ({selectedExercises.length})
          </label>

          {selectedExercises.map((exercise, index) => (
            <div
              key={`${exercise.exerciseId}-${index}`}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">
                  {index + 1}. {exercise.exerciseName}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveExercise(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Monter"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveExercise(index, "down")}
                    disabled={index === selectedExercises.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Descendre"
                  >
                    <svg
                      className="w-4 h-4"
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
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="p-1 text-red-400 hover:text-red-600 ml-2"
                    title="Supprimer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Series
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.sets || ""}
                    onChange={(e) =>
                      updateExercise(
                        index,
                        "sets",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    placeholder="-"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Repetitions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.reps || ""}
                    onChange={(e) =>
                      updateExercise(
                        index,
                        "reps",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    placeholder="-"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Duree (sec)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.duration || ""}
                    onChange={(e) =>
                      updateExercise(
                        index,
                        "duration",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    placeholder="-"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Distance (m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.distance || ""}
                    onChange={(e) =>
                      updateExercise(
                        index,
                        "distance",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    placeholder="-"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Intensite
                  </label>
                  <select
                    value={exercise.intensity || ""}
                    onChange={(e) =>
                      updateExercise(
                        index,
                        "intensity",
                        e.target.value || null
                      )
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-</option>
                    {intensityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={exercise.notes || ""}
                    onChange={(e) =>
                      updateExercise(index, "notes", e.target.value || null)
                    }
                    placeholder="Notes..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
