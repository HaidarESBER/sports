"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { SearchFilters, FilterState } from "@/components/SearchFilters"
import { UserCard } from "@/components/UserCard"

// Types for API responses
type Author = {
  id: string
  name: string | null
  image: string | null
}

type DiscoverProgram = {
  id: string
  name: string
  description: string | null
  sport: string
  durationWeeks: number
  difficulty: string | null
  isPublic: boolean
  createdAt: string
  author: Author
  _count: {
    programSessions: number
  }
}

type DiscoverSession = {
  id: string
  name: string
  description: string | null
  sport: string
  estimatedDuration: number | null
  createdAt: string
  author: Author
  _count: {
    exercises: number
  }
}

type DiscoverUser = {
  id: string
  name: string | null
  image: string | null
  bio: string | null
  location: string | null
  isFollowing: boolean
  _count: {
    programs: number
    followers: number
    following: number
  }
}

type TabType = "programs" | "sessions" | "users"

const tabs: { id: TabType; label: string }[] = [
  { id: "programs", label: "Programmes" },
  { id: "sessions", label: "Seances" },
  { id: "users", label: "Utilisateurs" },
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

const difficultyLabels: Record<string, string> = {
  debutant: "Debutant",
  intermediaire: "Intermediaire",
  avance: "Avance",
}

type DiscoverTabsProps = {
  initialTab?: TabType
  isAuthenticated?: boolean
}

export function DiscoverTabs({ initialTab = "programs", isAuthenticated = false }: DiscoverTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get("tab") as TabType) || initialTab
  )
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    sport: "",
    difficulty: "",
    minDuration: "",
    maxDuration: "",
  })

  // Results state
  const [programs, setPrograms] = useState<DiscoverProgram[]>([])
  const [sessions, setSessions] = useState<DiscoverSession[]>([])
  const [users, setUsers] = useState<DiscoverUser[]>([])
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({})

  // Pagination state
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "20")

      if (search) params.set("search", search)
      if (filters.sport) params.set("sport", filters.sport)

      if (activeTab === "programs") {
        if (filters.difficulty) params.set("difficulty", filters.difficulty)
        if (filters.minDuration) params.set("minWeeks", filters.minDuration)
        if (filters.maxDuration) params.set("maxWeeks", filters.maxDuration)

        const response = await fetch(`/api/discover/programs?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setPrograms(data.programs)
          setTotalPages(data.totalPages)
          setTotal(data.total)
        }
      } else if (activeTab === "sessions") {
        if (filters.minDuration) params.set("minDuration", filters.minDuration)
        if (filters.maxDuration) params.set("maxDuration", filters.maxDuration)

        const response = await fetch(`/api/discover/sessions?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setSessions(data.sessions)
          setTotalPages(data.totalPages)
          setTotal(data.total)
        }
      } else if (activeTab === "users") {
        // Users don't have sport filter, remove it
        params.delete("sport")

        const response = await fetch(`/api/discover/users?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
          setTotalPages(data.totalPages)
          setTotal(data.total)

          // Initialize following status from API response
          const statusMap: Record<string, boolean> = {}
          data.users.forEach((user: DiscoverUser) => {
            statusMap[user.id] = user.isFollowing
          })
          setFollowingStatus(statusMap)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, page, search, filters])

  // Fetch data on mount and when params change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleTabChange(tab: TabType) {
    setActiveTab(tab)
    setPage(1)
    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.push(`/discover?${params.toString()}`, { scroll: false })
  }

  function handleSearch(query: string) {
    setSearch(query)
    setPage(1)
  }

  function handleFilterChange(newFilters: FilterState) {
    setFilters(newFilters)
    setPage(1)
  }

  function handleFollowChange(userId: string, isFollowing: boolean) {
    setFollowingStatus((prev) => ({ ...prev, [userId]: isFollowing }))
  }

  // Determine which filters to show based on active tab
  const showDifficultyFilter = activeTab === "programs"
  const showDurationFilter = activeTab === "programs" || activeTab === "sessions"
  const showSportFilter = activeTab !== "users"

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        showSportFilter={showSportFilter}
        showDifficultyFilter={showDifficultyFilter}
        showDurationFilter={showDurationFilter}
      />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-gray-500">
          {total} resultat{total !== 1 ? "s" : ""} trouve{total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement...</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <>
          {/* Programs tab */}
          {activeTab === "programs" && (
            programs.length === 0 ? (
              <EmptyState type="programs" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            )
          )}

          {/* Sessions tab */}
          {activeTab === "sessions" && (
            sessions.length === 0 ? (
              <EmptyState type="sessions" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )
          )}

          {/* Users tab */}
          {activeTab === "users" && (
            users.length === 0 ? (
              <EmptyState type="users" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFollowing={isAuthenticated ? followingStatus[user.id] : undefined}
                    onFollowChange={
                      isAuthenticated
                        ? (isFollowing) => handleFollowChange(user.id, isFollowing)
                        : undefined
                    }
                  />
                ))}
              </div>
            )
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Precedent
              </button>
              <span className="text-sm text-gray-700">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Empty state component
function EmptyState({ type }: { type: "programs" | "sessions" | "users" }) {
  const messages = {
    programs: {
      title: "Aucun programme trouve",
      description: "Essayez de modifier vos filtres ou votre recherche.",
    },
    sessions: {
      title: "Aucune seance trouvee",
      description: "Essayez de modifier vos filtres ou votre recherche.",
    },
    users: {
      title: "Aucun utilisateur trouve",
      description: "Essayez de modifier votre recherche.",
    },
  }

  return (
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
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        {messages[type].title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">{messages[type].description}</p>
    </div>
  )
}

// Simplified ProgramCard for discovery (different from owner's view)
function ProgramCard({ program }: { program: DiscoverProgram }) {
  const sportColor = sportColors[program.sport] || sportColors.other
  const sportLabel = sportLabels[program.sport] || program.sport
  const difficultyLabel = program.difficulty
    ? difficultyLabels[program.difficulty] || program.difficulty
    : null

  return (
    <Link
      href={`/programs/${program.id}`}
      className="block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {program.name}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sportColor.bg} ${sportColor.text}`}
          >
            {sportLabel}
          </span>
        </div>

        {program.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {program.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
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
            {program._count.programSessions} seance{program._count.programSessions !== 1 ? "s" : ""}
          </span>
          {difficultyLabel && (
            <span className="text-xs text-gray-500">{difficultyLabel}</span>
          )}
        </div>

        {/* Author info */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {program.author.image ? (
            <img
              src={program.author.image}
              alt={program.author.name || "Author"}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-xs">
                {program.author.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-600 truncate">
            {program.author.name || "Utilisateur"}
          </span>
        </div>
      </div>
    </Link>
  )
}

// Simplified SessionCard for discovery (different from owner's view)
function SessionCard({ session }: { session: DiscoverSession }) {
  const sportColor = sportColors[session.sport] || sportColors.other
  const sportLabel = sportLabels[session.sport] || session.sport

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {session.name}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sportColor.bg} ${sportColor.text}`}
          >
            {sportLabel}
          </span>
        </div>

        {session.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {session.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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
            {session._count.exercises} exercice{session._count.exercises !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Author info */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {session.author.image ? (
            <img
              src={session.author.image}
              alt={session.author.name || "Author"}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-xs">
                {session.author.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-600 truncate">
            {session.author.name || "Utilisateur"}
          </span>
        </div>
      </div>
    </Link>
  )
}
