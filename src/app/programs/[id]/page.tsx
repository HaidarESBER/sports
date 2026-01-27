import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { DeleteProgramButton } from "./DeleteProgramButton"

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

const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user?.id) {
    redirect("/login")
  }

  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      programSessions: {
        include: {
          session: true,
        },
        orderBy: [
          { weekNumber: "asc" },
          { dayOfWeek: "asc" },
          { order: "asc" },
        ],
      },
    },
  })

  if (!program) {
    notFound()
  }

  if (program.authorId !== session.user.id) {
    redirect("/programs")
  }

  const sportColor = sportColors[program.sport] || sportColors.other
  const sportLabel = sportLabels[program.sport] || program.sport
  const difficultyColor = program.difficulty
    ? difficultyColors[program.difficulty] || difficultyColors.debutant
    : null
  const difficultyLabel = program.difficulty
    ? difficultyLabels[program.difficulty] || program.difficulty
    : null

  // Get sessions from program for calendar
  const programSessions = program.programSessions

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date)
  }

  // Build calendar data
  function getSessionsForCell(week: number, day: number) {
    return programSessions
      .filter((ps) => ps.weekNumber === week && ps.dayOfWeek === day)
      .sort((a, b) => a.order - b.order)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/programs"
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
          Retour aux programmes
        </Link>

        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {program.name}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sportColor.bg} ${sportColor.text}`}
                >
                  {sportLabel}
                </span>
                {difficultyColor && difficultyLabel && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColor.bg} ${difficultyColor.text}`}
                  >
                    {difficultyLabel}
                  </span>
                )}
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

              {program.description && (
                <p className="text-gray-600 mb-4">{program.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
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
                  Programme de {program.durationWeeks} semaine
                  {program.durationWeeks !== 1 ? "s" : ""}
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
                  {program.programSessions.length} seance
                  {program.programSessions.length !== 1 ? "s" : ""} planifiee
                  {program.programSessions.length !== 1 ? "s" : ""}
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Cree le {formatDate(program.createdAt)}
                </span>
                {program.updatedAt.getTime() !== program.createdAt.getTime() && (
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Modifie le {formatDate(program.updatedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 sm:mt-0 sm:ml-6 flex gap-2">
              <Link
                href={`/programs/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="w-4 h-4 mr-2 -ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifier
              </Link>
              <DeleteProgramButton programId={id} />
            </div>
          </div>
        </div>

        {/* Calendar view */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Planning des seances
          </h2>

          {program.programSessions.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-2 text-sm text-gray-500">
                Aucune seance planifiee dans ce programme
              </p>
              <Link
                href={`/programs/${id}/edit`}
                className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                Planifier des seances
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header row */}
                <div className="grid grid-cols-8 gap-1 mb-2">
                  <div className="text-sm font-medium text-gray-500 py-2 px-2"></div>
                  {dayLabels.map((day, index) => (
                    <div
                      key={index}
                      className="text-sm font-medium text-gray-700 py-2 px-2 text-center bg-gray-100 rounded"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Week rows */}
                {Array.from(
                  { length: program.durationWeeks },
                  (_, weekIndex) => {
                    const week = weekIndex + 1
                    return (
                      <div key={week} className="grid grid-cols-8 gap-1 mb-1">
                        {/* Week label */}
                        <div className="text-sm font-medium text-gray-500 py-2 px-2 flex items-center">
                          Sem. {week}
                        </div>

                        {/* Day cells */}
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const day = dayIndex + 1
                          const cellSessions = getSessionsForCell(week, day)

                          return (
                            <div
                              key={day}
                              className="min-h-[60px] border border-gray-200 rounded p-1 bg-white"
                            >
                              <div className="space-y-1">
                                {cellSessions.map((ps) => (
                                  <Link
                                    key={ps.id}
                                    href={`/sessions/${ps.sessionId}`}
                                    className="block bg-blue-100 text-blue-800 text-xs rounded px-1.5 py-1 hover:bg-blue-200 transition-colors"
                                  >
                                    <span className="truncate block">
                                      {ps.session.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
