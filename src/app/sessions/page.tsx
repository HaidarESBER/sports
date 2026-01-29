import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { SessionCard } from "@/components/SessionCard"

const sportFilters = [
  { id: "all", label: "Tous" },
  { id: "running", label: "Course" },
  { id: "swimming", label: "Natation" },
  { id: "cycling", label: "Cyclisme" },
  { id: "strength", label: "Musculation" },
  { id: "other", label: "Autre" },
]

type PageProps = {
  searchParams: Promise<{ sport?: string }>
}

export default async function SessionsPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const params = await searchParams
  const sportFilter = params.sport || "all"

  const sessions = await prisma.session.findMany({
    where: {
      authorId: session.user.id,
      ...(sportFilter !== "all" && { sport: sportFilter }),
    },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Mes Seances</h1>
            <p className="mt-1 text-sm text-gray-400">
              Gerez vos seances d&apos;entrainement
            </p>
          </div>
          <Link
            href="/sessions/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
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
            Nouvelle seance
          </Link>
        </div>

        {/* Sport filter tabs */}
        <div className="mb-6 border-b border-gray-900">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {sportFilters.map((filter) => {
              const isActive = sportFilter === filter.id
              return (
                <Link
                  key={filter.id}
                  href={filter.id === "all" ? "/sessions" : `/sessions?sport=${filter.id}`}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? "border-white text-white"
                      : "border-transparent text-gray-400 hover:text-white hover:border-gray-700"
                  }`}
                >
                  {filter.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sessions grid or empty state */}
        {sessions.length === 0 ? (
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
              Aucune seance
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Creez votre premiere seance d&apos;entrainement!
            </p>
            <div className="mt-6">
              <Link
                href="/sessions/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
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
                Nouvelle seance
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={{
                  ...session,
                  createdAt: session.createdAt.toISOString(),
                  updatedAt: session.updatedAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
