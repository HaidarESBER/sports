"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/Toast"

type FollowButtonProps = {
  userId: string
  isFollowing: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

export function FollowButton({ userId, isFollowing: initialIsFollowing, onFollowChange }: FollowButtonProps) {
  const router = useRouter()
  const toast = useToast()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)
    try {
      const method = isFollowing ? "DELETE" : "POST"
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
      })

      if (response.ok) {
        const newIsFollowing = !isFollowing
        setIsFollowing(newIsFollowing)
        onFollowChange?.(newIsFollowing)
        toast.showToast(
          newIsFollowing ? "Vous suivez maintenant cet utilisateur" : "Vous ne suivez plus cet utilisateur",
          "success"
        )
      } else {
        if (response.status === 401) {
          toast.showToast("Connectez-vous pour suivre cet utilisateur", "info")
          router.push("/login")
        } else {
          console.error("Failed to update follow status")
          toast.showToast("Erreur lors de la mise à jour", "error")
        }
      }
    } catch (error) {
      console.error("Error updating follow status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
        isFollowing
          ? "text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 focus:ring-gray-500"
          : "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
      }`}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isFollowing ? (
        "Abonne"
      ) : (
        "Suivre"
      )}
    </button>
  )
}
