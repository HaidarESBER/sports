"use client"

import Link from "next/link"
import { FollowButton } from "./FollowButton"

type User = {
  id: string
  name: string | null
  image: string | null
  bio: string | null
}

type UserCardProps = {
  user: User
  isFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

function getInitial(name: string | null): string {
  if (!name) return "?"
  return name.charAt(0).toUpperCase()
}

function truncateBio(bio: string | null, maxLength: number = 100): string {
  if (!bio) return ""
  if (bio.length <= maxLength) return bio
  return bio.substring(0, maxLength).trim() + "..."
}

export function UserCard({ user, isFollowing, onFollowChange }: UserCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-950 transition-all">
      <Link href={`/users/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar */}
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-300 font-semibold text-lg">
              {getInitial(user.name)}
            </span>
          </div>
        )}

        {/* User info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {user.name || "Utilisateur"}
          </h3>
          {user.bio && (
            <p className="text-sm text-gray-400 line-clamp-2">
              {truncateBio(user.bio)}
            </p>
          )}
        </div>
      </Link>

      {/* Follow button */}
      {isFollowing !== undefined && onFollowChange && (
        <div className="flex-shrink-0">
          <FollowButton
            userId={user.id}
            isFollowing={isFollowing}
            onFollowChange={onFollowChange}
          />
        </div>
      )}
    </div>
  )
}
