"use client"

import { memo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
  createdAt: string
  updatedAt: string
  exercises: SessionExercise[]
}

type SessionCardProps = {
  session: Session
  onDelete?: () => void
}

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

function SessionCardComponent({ session, onDelete }: SessionCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const sportColor = sportColors[session.sport] || sportColors.other
  const sportLabel = sportLabels[session.sport] || session.sport

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete?.()
        router.refresh()
      } else {
        console.error("Failed to delete session")
      }
    } catch (error) {
      console.error("Error deleting session:", error)
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800 overflow-hidden hover:border-gray-700 hover:bg-gray-950 transition-all">
      <Link href={`/sessions/${session.id}`} className="block p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white truncate">
            {session.name}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sportColor.bg} ${sportColor.text}`}
          >
            {sportLabel}
          </span>
        </div>

        {session.description && (
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
            {session.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-400">
          {session.estimatedDuration && (
            <span className="flex items-center">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {session.estimatedDuration} min
            </span>
          )}
          <span className="flex items-center">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {session.exercises.length} exercice{session.exercises.length !== 1 ? "s" : ""}
          </span>
        </div>
      </Link>

      <div className="border-t border-gray-800 px-4 py-3 bg-gray-950 flex justify-end gap-2">
        <Link
          href={`/sessions/${session.id}/edit`}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gray-900 border border-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
        >
          Modifier
        </Link>
        {showConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? "..." : "Confirmer"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gray-900 border border-gray-700 rounded-md hover:bg-gray-800"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-400 bg-gray-900 border border-red-800 rounded-md hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  )
}

export const SessionCard = memo(SessionCardComponent)
