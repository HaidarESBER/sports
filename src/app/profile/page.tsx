import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      bio: true,
      location: true,
      isPublic: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          programs: true,
          sessions: true,
        }
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  // Get recent programs (3)
  const recentPrograms = await prisma.program.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 3,
    select: {
      id: true,
      name: true,
      sport: true,
      durationWeeks: true,
      isPublic: true,
    }
  })

  // Get recent sessions (3)
  const recentSessions = await prisma.session.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 3,
    select: {
      id: true,
      name: true,
      sport: true,
      estimatedDuration: true,
    }
  })

  const sportLabels: Record<string, string> = {
    running: "Course",
    swimming: "Natation",
    cycling: "Cyclisme",
    strength: "Musculation",
    other: "Autre",
  }

  function getInitial(name: string | null): string {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-900 rounded-lg shadow border border-gray-800 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Profile"}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-2xl">
                    {getInitial(user.name)}
                  </span>
                </div>
              )}

              {/* User info */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user.name || "Utilisateur"}
                </h1>
                {user.location && (
                  <p className="text-sm text-gray-400 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.location}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-1">
                  Membre depuis {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier le profil
            </Link>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-4 text-gray-300">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            <Link href={`/users/${user.id}?tab=followers`} className="text-center hover:text-white">
              <span className="block text-2xl font-bold text-white">{user._count.followers}</span>
              <span className="text-sm text-gray-400">Abonnes</span>
            </Link>
            <Link href={`/users/${user.id}?tab=following`} className="text-center hover:text-white">
              <span className="block text-2xl font-bold text-white">{user._count.following}</span>
              <span className="text-sm text-gray-400">Abonnements</span>
            </Link>
            <Link href="/programs" className="text-center hover:text-white">
              <span className="block text-2xl font-bold text-white">{user._count.programs}</span>
              <span className="text-sm text-gray-400">Programmes</span>
            </Link>
            <Link href="/sessions" className="text-center hover:text-white">
              <span className="block text-2xl font-bold text-white">{user._count.sessions}</span>
              <span className="text-sm text-gray-400">Seances</span>
            </Link>
          </div>

          {/* Visibility badge */}
          <div className="mt-4 flex items-center">
            {user.isPublic ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Profil public
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Profil prive
              </span>
            )}
          </div>
        </div>

        {/* Recent Programs */}
        <div className="bg-gray-900 rounded-lg shadow border border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Programmes recents</h2>
            <Link href="/programs" className="text-sm text-white hover:text-gray-300">
              Voir tout
            </Link>
          </div>

          {recentPrograms.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-2">Aucun programme</p>
              <Link href="/programs/new" className="text-white hover:text-gray-300 text-sm">
                Creer un programme
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPrograms.map((program) => (
                <Link
                  key={program.id}
                  href={`/programs/${program.id}`}
                  className="block p-3 border border-gray-800 rounded-md hover:bg-gray-950 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{program.name}</h3>
                      <p className="text-sm text-gray-400">
                        {sportLabels[program.sport] || program.sport} - {program.durationWeeks} semaine{program.durationWeeks !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {program.isPublic && (
                      <span className="text-xs text-purple-600">Public</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-gray-900 rounded-lg shadow border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Seances recentes</h2>
            <Link href="/sessions" className="text-sm text-white hover:text-gray-300">
              Voir tout
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-2">Aucune seance</p>
              <Link href="/sessions/new" className="text-white hover:text-gray-300 text-sm">
                Creer une seance
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="block p-3 border border-gray-800 rounded-md hover:bg-gray-950 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{session.name}</h3>
                      <p className="text-sm text-gray-400">
                        {sportLabels[session.sport] || session.sport}
                        {session.estimatedDuration && ` - ${session.estimatedDuration} min`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
