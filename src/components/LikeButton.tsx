"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type LikeButtonProps = {
  type: "program" | "session"
  targetId: string
  initialIsLiked: boolean
  initialLikesCount: number
  onLikeChange?: (isLiked: boolean, count: number) => void
}

export function LikeButton({
  type,
  targetId,
  initialIsLiked,
  initialLikesCount,
  onLikeChange,
}: LikeButtonProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    // Optimistic update
    const previousIsLiked = isLiked
    const previousCount = likesCount
    const newIsLiked = !isLiked
    const newCount = newIsLiked ? likesCount + 1 : likesCount - 1

    setIsLiked(newIsLiked)
    setLikesCount(newCount)
    setIsLoading(true)

    try {
      const endpoint = `/api/${type}s/${targetId}/like`
      const method = newIsLiked ? "POST" : "DELETE"
      const response = await fetch(endpoint, { method })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
        onLikeChange?.(data.isLiked, data.likesCount)
      } else {
        // Revert on error
        setIsLiked(previousIsLiked)
        setLikesCount(previousCount)
        if (response.status === 401) {
          router.push("/login")
        }
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked)
      setLikesCount(previousCount)
      console.error("Error updating like status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-100"
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : isLiked ? (
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
      ) : (
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      <span className={isLiked ? "text-red-500" : "text-gray-700"}>
        {likesCount}
      </span>
    </button>
  )
}

