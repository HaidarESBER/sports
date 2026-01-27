import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProgramCard } from "@/components/ProgramCard"

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

export default async function ProgramsPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const params = await searchParams
  const sportFilter = params.sport || "all"

  const programs = await prisma.program.findMany({
    where: {
      authorId: session.user.id,
      ...(sportFilter !== "all" && { sport: sportFilter }),
    },
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
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Programmes</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gerez vos programmes d&apos;entrainement
            </p>
          </div>
          <Link
            href="/programs/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            Nouveau programme
          </Link>
        </div>

        {/* Sport filter tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {sportFilters.map((filter) => {
              const isActive = sportFilter === filter.id
              return (
                <Link
                  key={filter.id}
                  href={filter.id === "all" ? "/programs" : `/programs?sport=${filter.id}`}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {filter.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Programs grid or empty state */}
        {programs.length === 0 ? (
          <div className="text-center py-12">
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucun programme
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Creez votre premier programme d&apos;entrainement!
            </p>
            <div className="mt-6">
              <Link
                href="/programs/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                Nouveau programme
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={{
                  ...program,
                  createdAt: program.createdAt.toISOString(),
                  updatedAt: program.updatedAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
