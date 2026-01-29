"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ActivityCard } from "@/components/ActivityCard"

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

type FeedResponse = {
  activities: Activity[]
  total: number
  page: number
  totalPages: number
}

export function FeedList() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities(1)
  }, [])

  async function fetchActivities(pageNum: number) {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/feed?page=${pageNum}&limit=20`)
      if (response.ok) {
        const data: FeedResponse = await response.json()
        if (pageNum === 1) {
          setActivities(data.activities)
        } else {
          setActivities((prev) => [...prev, ...data.activities])
        }
        setHasMore(data.page < data.totalPages)
      } else {
        setError("Erreur lors du chargement du feed")
      }
    } catch (err) {
      setError("Erreur lors du chargement du feed")
      console.error("Error fetching feed:", err)
    } finally {
      setLoading(false)
    }
  }

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage)
  }

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-lg shadow-md border border-gray-800 p-4 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-800 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && activities.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800 p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => fetchActivities(1)}
          className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-gray-100"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800 p-12 text-center">
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-white">
          Votre feed est vide
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          Suivez des utilisateurs pour voir leur activité!
        </p>
        <div className="mt-6">
          <Link
            href="/discover"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-white hover:bg-gray-100"
          >
            Découvrir des utilisateurs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}

      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-gray-800 rounded-md hover:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Chargement..." : "Charger plus"}
          </button>
        </div>
      )}
    </div>
  )
}


