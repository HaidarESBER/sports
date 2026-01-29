"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

const sportFilters = [
  { id: "all", label: "Tous" },
  { id: "running", label: "Course" },
  { id: "swimming", label: "Natation" },
  { id: "cycling", label: "Cyclisme" },
  { id: "strength", label: "Musculation" },
  { id: "other", label: "Autre" },
]

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

type Workout = {
  id: string
  name: string
  sport: string
  completedAt: string
  duration: number | null
  rating: number | null
  exercises: Array<{ id: string }>
}

type WorkoutsResponse = {
  workouts: Workout[]
  total: number
  page: number
  totalPages: number
}

function WorkoutsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [sportFilter, setSportFilter] = useState(searchParams.get("sport") || "all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "20")

      if (sportFilter !== "all") {
        params.set("sport", sportFilter)
      }
      if (fromDate) {
        params.set("from", fromDate)
      }
      if (toDate) {
        params.set("to", toDate)
      }

      const response = await fetch(`/api/workouts?${params.toString()}`)
      if (response.ok) {
        const data: WorkoutsResponse = await response.json()
        setWorkouts(data.workouts)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Error fetching workouts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, sportFilter, fromDate, toDate])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return null
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
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

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Historique des entraînements
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Consultez tous vos entraînements enregistrés
            </p>
          </div>
          <Link
            href="/workouts/log"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5 mr-2 -ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Enregistrer un entraînement
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Sport filter */}
          <div className="border-b border-gray-900">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {sportFilters.map((filter) => {
                const isActive = sportFilter === filter.id
                return (
                  <button
                    key={filter.id}
                    onClick={() => {
                      setSportFilter(filter.id)
                      setPage(1)
                    }}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? "border-white text-white"
                        : "border-transparent text-gray-400 hover:text-white hover:border-gray-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Date range filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Du
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setPage(1)
                }}
                className="block w-full rounded-md border-gray-800 bg-gray-900 text-white shadow-sm focus:border-gray-700 focus:ring-gray-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Au
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setPage(1)
                }}
                className="block w-full rounded-md border-gray-800 bg-gray-900 text-white shadow-sm focus:border-gray-700 focus:ring-gray-600 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Workouts list */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-t-white"></div>
            <p className="mt-2 text-sm text-gray-400">Chargement...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">
              Aucun entraînement
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Commencez à enregistrer vos entraînements!
            </p>
            <div className="mt-6">
              <Link
                href="/workouts/log"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-white hover:bg-gray-100"
              >
                Enregistrer un entraînement
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {workouts.map((workout) => {
                const sportColor = sportColors[workout.sport] || sportColors.other
                const sportLabel = sportLabels[workout.sport] || workout.sport

                return (
                  <Link
                    key={workout.id}
                    href={`/workouts/${workout.id}`}
                    className="block bg-gray-900 rounded-lg shadow-md border border-gray-800 overflow-hidden hover:border-gray-700 hover:bg-gray-950 transition-all"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {workout.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sportColor.bg} ${sportColor.text}`}
                        >
                          {sportLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{formatDate(workout.completedAt)}</span>
                        {workout.duration && (
                          <span>{workout.duration} min</span>
                        )}
                        {workout.rating && (
                          <div className="flex items-center">
                            {renderStars(workout.rating)}
                          </div>
                        )}
                        <span>
                          {workout.exercises.length} exercice
                          {workout.exercises.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-gray-800 rounded-md hover:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-400">
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-gray-800 rounded-md hover:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function WorkoutsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-t-white"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    }>
      <WorkoutsContent />
    </Suspense>
  )
}

