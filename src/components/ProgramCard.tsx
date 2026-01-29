"use client"

import { memo } from "react"
import Link from "next/link"

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
  createdAt: string
  updatedAt: string
  programSessions: ProgramSession[]
}

type ProgramCardProps = {
  program: Program
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

const difficultyColors: Record<string, { bg: string; text: string }> = {
  debutant: { bg: "bg-green-100", text: "text-green-700" },
  intermediaire: { bg: "bg-yellow-100", text: "text-yellow-700" },
  avance: { bg: "bg-red-100", text: "text-red-700" },
}

const difficultyLabels: Record<string, string> = {
  debutant: "Debutant",
  intermediaire: "Intermediaire",
  avance: "Avance",
}

function ProgramCardComponent({ program }: ProgramCardProps) {
  const sportColor = sportColors[program.sport] || sportColors.other
  const sportLabel = sportLabels[program.sport] || program.sport
  const difficultyColor = program.difficulty
    ? difficultyColors[program.difficulty] || difficultyColors.debutant
    : null
  const difficultyLabel = program.difficulty
    ? difficultyLabels[program.difficulty] || program.difficulty
    : null

  return (
    <Link
      href={`/programs/${program.id}`}
      className="block bg-gray-900 rounded-lg shadow-md border border-gray-800 overflow-hidden hover:border-gray-700 hover:bg-gray-950 transition-all"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white truncate">
            {program.name}
          </h3>
          <div className="flex gap-1.5 flex-shrink-0 ml-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sportColor.bg} ${sportColor.text}`}
            >
              {sportLabel}
            </span>
            {program.isPublic && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Public
              </span>
            )}
          </div>
        </div>

        {program.description && (
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
            {program.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {program.durationWeeks} semaine{program.durationWeeks !== 1 ? "s" : ""}
          </span>
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
            {program.programSessions.length} seance{program.programSessions.length !== 1 ? "s" : ""}
          </span>
          {difficultyColor && difficultyLabel && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor.bg} ${difficultyColor.text}`}
            >
              {difficultyLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export const ProgramCard = memo(ProgramCardComponent)
