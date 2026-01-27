import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { DeleteSessionButton } from "./DeleteSessionButton"
import { LikeButton } from "@/components/LikeButton"
import { CommentSection } from "@/components/CommentSection"

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

const intensityColors: Record<string, { bg: string; text: string }> = {
  easy: { bg: "bg-green-100", text: "text-green-700" },
  moderate: { bg: "bg-yellow-100", text: "text-yellow-700" },
  hard: { bg: "bg-orange-100", text: "text-orange-700" },
  max: { bg: "bg-red-100", text: "text-red-700" },
}

const intensityLabels: Record<string, string> = {
  easy: "Facile",
  moderate: "Modere",
  hard: "Difficile",
  max: "Maximum",
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function SessionDetailPage({ params }: PageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user?.id) {
    redirect("/login")
  }

  const trainingSession = await prisma.session.findUnique({
    where: { id },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
        orderBy: { order: "asc" },
      },
      author: {
        select: {
          id: true,
          isPublic: true,
        },
      },
    },
  })

  if (!trainingSession) {
    notFound()
  }

  if (trainingSession.authorId !== session.user.id) {
    redirect("/sessions")
  }

  const sportColor = sportColors[trainingSession.sport] || sportColors.other
  const sportLabel = sportLabels[trainingSession.sport] || trainingSession.sport

  // Check if user can view (author is public or user is owner)
  const canView =
    trainingSession.author.isPublic ||
    trainingSession.authorId === session.user.id

  // Get like count
  const likesCount = await prisma.like.count({
    where: { sessionId: id },
  })

  // Check if current user liked it
  let isLiked = false
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_sessionId: {
        userId: session.user.id,
        sessionId: id,
      },
    },
  })
  isLiked = !!existingLike

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/sessions"
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
          Retour aux seances
        </Link>

        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {trainingSession.name}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sportColor.bg} ${sportColor.text}`}
                >
                  {sportLabel}
                </span>
              </div>

              {trainingSession.description && (
                <p className="text-gray-600 mb-4">{trainingSession.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {trainingSession.estimatedDuration && (
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
                    {trainingSession.estimatedDuration} minutes
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Creee le {formatDate(trainingSession.createdAt)}
                </span>
                {trainingSession.updatedAt.getTime() !== trainingSession.createdAt.getTime() && (
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
                    Modifiee le {formatDate(trainingSession.updatedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 sm:mt-0 sm:ml-6 flex gap-2 items-center">
              {canView && (
                <LikeButton
                  type="session"
                  targetId={id}
                  initialIsLiked={isLiked}
                  initialLikesCount={likesCount}
                />
              )}
              <Link
                href={`/sessions/${id}/edit`}
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
              <DeleteSessionButton sessionId={id} />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Exercices ({trainingSession.exercises.length})
          </h2>

          {trainingSession.exercises.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                Aucun exercice dans cette seance
              </p>
              <Link
                href={`/sessions/${id}/edit`}
                className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                Ajouter des exercices
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trainingSession.exercises.map((sessionExercise, index) => (
                <div
                  key={sessionExercise.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {index + 1}. {sessionExercise.exercise.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sessionExercise.sets && sessionExercise.reps && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sessionExercise.sets}x{sessionExercise.reps}
                      </span>
                    )}
                    {sessionExercise.sets && !sessionExercise.reps && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sessionExercise.sets} series
                      </span>
                    )}
                    {sessionExercise.duration && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {sessionExercise.duration >= 60
                          ? `${Math.floor(sessionExercise.duration / 60)}min${
                              sessionExercise.duration % 60 > 0
                                ? ` ${sessionExercise.duration % 60}s`
                                : ""
                            }`
                          : `${sessionExercise.duration}s`}
                      </span>
                    )}
                    {sessionExercise.distance && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {sessionExercise.distance >= 1000
                          ? `${(sessionExercise.distance / 1000).toFixed(1)}km`
                          : `${sessionExercise.distance}m`}
                      </span>
                    )}
                    {sessionExercise.intensity && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          intensityColors[sessionExercise.intensity]?.bg || "bg-gray-100"
                        } ${
                          intensityColors[sessionExercise.intensity]?.text || "text-gray-800"
                        }`}
                      >
                        {intensityLabels[sessionExercise.intensity] ||
                          sessionExercise.intensity}
                      </span>
                    )}
                  </div>

                  {sessionExercise.notes && (
                    <p className="mt-2 text-sm text-gray-500">
                      {sessionExercise.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments section */}
        {canView && (
          <div className="mt-6">
            <CommentSection
              type="session"
              targetId={id}
              currentUserId={session.user.id}
            />
          </div>
        )}
      </div>
    </div>
  )
}
