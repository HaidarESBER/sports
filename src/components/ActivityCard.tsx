"use client"

import Link from "next/link"

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

type Activity = {
  id: string
  type: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  program?: {
    id: string
    name: string
    sport: string
  } | null
  session?: {
    id: string
    name: string
    sport: string
  } | null
  targetUser?: {
    id: string
    name: string | null
    image: string | null
  } | null
}

type ActivityCardProps = {
  activity: Activity
}

export function ActivityCard({ activity }: ActivityCardProps) {
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(date)
  }

  function getInitial(name: string | null): string {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  function getActivityText(): string {
    const userName = activity.user.name || "Utilisateur"
    switch (activity.type) {
      case "like_program":
        return `${userName} a aimé le programme`
      case "like_session":
        return `${userName} a aimé la séance`
      case "comment_program":
        return `${userName} a commenté le programme`
      case "comment_session":
        return `${userName} a commenté la séance`
      case "create_program":
        return `${userName} a créé le programme`
      case "create_session":
        return `${userName} a créé la séance`
      case "follow":
        return `${userName} suit maintenant`
      default:
        return `${userName} a effectué une action`
    }
  }

  function getActivityIcon() {
    switch (activity.type) {
      case "like_program":
      case "like_session":
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        )
      case "comment_program":
      case "comment_session":
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )
      case "create_program":
      case "create_session":
        return (
          <svg
            className="w-5 h-5 text-green-500"
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
        )
      case "follow":
        return (
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  const sportColor =
    activity.program || activity.session
      ? sportColors[(activity.program || activity.session)!.sport] ||
        sportColors.other
      : null
  const sportLabel =
    activity.program || activity.session
      ? sportLabels[(activity.program || activity.session)!.sport] ||
        (activity.program || activity.session)!.sport
      : null

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        {/* User avatar */}
        <Link href={`/users/${activity.user.id}`} className="flex-shrink-0">
          {activity.user.image ? (
            <img
              src={activity.user.image}
              alt={activity.user.name || "User"}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
              {getInitial(activity.user.name)}
            </div>
          )}
        </Link>

        {/* Activity content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            {getActivityIcon()}
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                {getActivityText()}{" "}
                {activity.program && (
                  <Link
                    href={`/programs/${activity.program.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {activity.program.name}
                  </Link>
                )}
                {activity.session && (
                  <Link
                    href={`/sessions/${activity.session.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {activity.session.name}
                  </Link>
                )}
                {activity.targetUser && (
                  <Link
                    href={`/users/${activity.targetUser.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {activity.targetUser.name || "Utilisateur"}
                  </Link>
                )}
              </p>
              {sportLabel && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${sportColor?.bg} ${sportColor?.text}`}
                >
                  {sportLabel}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}

