import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProgramCard } from "@/components/ProgramCard"
import { PublicProfileTabs } from "./PublicProfileTabs"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function PublicProfilePage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { tab } = await searchParams
  const session = await auth()
  const viewerId = session?.user?.id

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
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
          programs: {
            where: { isPublic: true }
          },
        }
      }
    }
  })

  if (!user) {
    notFound()
  }

  // Check visibility
  const isOwner = viewerId === user.id
  if (!user.isPublic && !isOwner) {
    notFound()
  }

  // Check if viewer is following this user
  let isFollowing = false
  if (viewerId && viewerId !== user.id) {
    const followRecord = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewerId,
          followingId: user.id,
        }
      }
    })
    isFollowing = !!followRecord
  }

  // Get user's public programs
  const programs = await prisma.program.findMany({
    where: {
      authorId: user.id,
      isPublic: true,
    },
    include: {
      programSessions: {
        include: {
          session: {
            select: {
              id: true,
              name: true,
              sport: true,
            }
          }
        }
      }
    },
    orderBy: { updatedAt: "desc" },
  })

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

  const activeTab = tab || "programs"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name || "Utilisateur"}
                </h1>
                {user.location && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.location}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Membre depuis {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Follow button or Edit profile link */}
            {isOwner ? (
              <Link
                href="/profile/edit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier le profil
              </Link>
            ) : viewerId ? (
              <PublicProfileTabs
                userId={user.id}
                initialIsFollowing={isFollowing}
                showFollowButton={true}
              />
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Se connecter pour suivre
              </Link>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-4 text-gray-600">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            <Link href={`/users/${user.id}?tab=followers`} className="text-center hover:text-blue-600">
              <span className="block text-2xl font-bold text-gray-900">{user._count.followers}</span>
              <span className="text-sm text-gray-500">Abonnes</span>
            </Link>
            <Link href={`/users/${user.id}?tab=following`} className="text-center hover:text-blue-600">
              <span className="block text-2xl font-bold text-gray-900">{user._count.following}</span>
              <span className="text-sm text-gray-500">Abonnements</span>
            </Link>
            <Link href={`/users/${user.id}?tab=programs`} className="text-center hover:text-blue-600">
              <span className="block text-2xl font-bold text-gray-900">{user._count.programs}</span>
              <span className="text-sm text-gray-500">Programmes</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <Link
              href={`/users/${user.id}?tab=programs`}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "programs"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Programmes
            </Link>
            <Link
              href={`/users/${user.id}?tab=followers`}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "followers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Abonnes ({user._count.followers})
            </Link>
            <Link
              href={`/users/${user.id}?tab=following`}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "following"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Abonnements ({user._count.following})
            </Link>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "programs" && (
          <div>
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Aucun programme public
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cet utilisateur n&apos;a pas encore de programmes publics.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        )}

        {activeTab === "followers" && (
          <PublicProfileTabs
            userId={user.id}
            initialIsFollowing={isFollowing}
            showFollowButton={false}
            showFollowers={true}
            viewerId={viewerId}
          />
        )}

        {activeTab === "following" && (
          <PublicProfileTabs
            userId={user.id}
            initialIsFollowing={isFollowing}
            showFollowButton={false}
            showFollowing={true}
            viewerId={viewerId}
          />
        )}
      </div>
    </div>
  )
}
