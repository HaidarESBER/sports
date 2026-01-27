"use client"

import { useState, useEffect } from "react"
import { UserCard } from "@/components/UserCard"
import { FollowButton } from "@/components/FollowButton"

type User = {
  id: string
  name: string | null
  image: string | null
  bio: string | null
}

type PublicProfileTabsProps = {
  userId: string
  initialIsFollowing: boolean
  showFollowButton?: boolean
  showFollowers?: boolean
  showFollowing?: boolean
  viewerId?: string
}

export function PublicProfileTabs({
  userId,
  initialIsFollowing,
  showFollowButton = false,
  showFollowers = false,
  showFollowing = false,
  viewerId,
}: PublicProfileTabsProps) {
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [followersPage, setFollowersPage] = useState(1)
  const [followingPage, setFollowingPage] = useState(1)
  const [followersTotalPages, setFollowersTotalPages] = useState(1)
  const [followingTotalPages, setFollowingTotalPages] = useState(1)
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false)
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false)
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({})

  // Load followers
  useEffect(() => {
    if (!showFollowers) return

    async function loadFollowers() {
      setIsLoadingFollowers(true)
      try {
        const response = await fetch(`/api/users/${userId}/followers?page=${followersPage}&limit=20`)
        if (response.ok) {
          const data = await response.json()
          if (followersPage === 1) {
            setFollowers(data.followers)
          } else {
            setFollowers((prev) => [...prev, ...data.followers])
          }
          setFollowersTotalPages(data.totalPages)

          // Check following status for each user if viewer is logged in
          if (viewerId) {
            const statusMap: Record<string, boolean> = {}
            for (const user of data.followers) {
              if (user.id !== viewerId) {
                const followResponse = await fetch(`/api/users/${user.id}`)
                if (followResponse.ok) {
                  const userData = await followResponse.json()
                  statusMap[user.id] = userData.isFollowing
                }
              }
            }
            setFollowingStatus((prev) => ({ ...prev, ...statusMap }))
          }
        }
      } catch (error) {
        console.error("Error loading followers:", error)
      } finally {
        setIsLoadingFollowers(false)
      }
    }

    loadFollowers()
  }, [userId, followersPage, showFollowers, viewerId])

  // Load following
  useEffect(() => {
    if (!showFollowing) return

    async function loadFollowing() {
      setIsLoadingFollowing(true)
      try {
        const response = await fetch(`/api/users/${userId}/following?page=${followingPage}&limit=20`)
        if (response.ok) {
          const data = await response.json()
          if (followingPage === 1) {
            setFollowing(data.following)
          } else {
            setFollowing((prev) => [...prev, ...data.following])
          }
          setFollowingTotalPages(data.totalPages)

          // Check following status for each user if viewer is logged in
          if (viewerId) {
            const statusMap: Record<string, boolean> = {}
            for (const user of data.following) {
              if (user.id !== viewerId) {
                const followResponse = await fetch(`/api/users/${user.id}`)
                if (followResponse.ok) {
                  const userData = await followResponse.json()
                  statusMap[user.id] = userData.isFollowing
                }
              }
            }
            setFollowingStatus((prev) => ({ ...prev, ...statusMap }))
          }
        }
      } catch (error) {
        console.error("Error loading following:", error)
      } finally {
        setIsLoadingFollowing(false)
      }
    }

    loadFollowing()
  }, [userId, followingPage, showFollowing, viewerId])

  function handleFollowChange(targetUserId: string, isNowFollowing: boolean) {
    setFollowingStatus((prev) => ({ ...prev, [targetUserId]: isNowFollowing }))
  }

  // Just show follow button
  if (showFollowButton) {
    return (
      <FollowButton
        userId={userId}
        isFollowing={initialIsFollowing}
      />
    )
  }

  // Show followers list
  if (showFollowers) {
    return (
      <div>
        {isLoadingFollowers && followers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : followers.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucun abonne
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Personne ne suit encore cet utilisateur.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {followers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isFollowing={viewerId && user.id !== viewerId ? followingStatus[user.id] : undefined}
                onFollowChange={
                  viewerId && user.id !== viewerId
                    ? (isFollowing) => handleFollowChange(user.id, isFollowing)
                    : undefined
                }
              />
            ))}

            {followersPage < followersTotalPages && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setFollowersPage((p) => p + 1)}
                  disabled={isLoadingFollowers}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoadingFollowers ? "Chargement..." : "Charger plus"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Show following list
  if (showFollowing) {
    return (
      <div>
        {isLoadingFollowing && following.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : following.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucun abonnement
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Cet utilisateur ne suit personne.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {following.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isFollowing={viewerId && user.id !== viewerId ? followingStatus[user.id] : undefined}
                onFollowChange={
                  viewerId && user.id !== viewerId
                    ? (isFollowing) => handleFollowChange(user.id, isFollowing)
                    : undefined
                }
              />
            ))}

            {followingPage < followingTotalPages && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setFollowingPage((p) => p + 1)}
                  disabled={isLoadingFollowing}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoadingFollowing ? "Chargement..." : "Charger plus"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return null
}
