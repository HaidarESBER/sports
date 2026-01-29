"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { StatsCard } from "@/components/StatsCard"
import { WorkoutChart } from "@/components/WorkoutChart"

type Period = "week" | "month" | "year" | "all"

type WorkoutStats = {
  totalWorkouts: number
  totalDuration: number
  averageDuration: number
  workoutsBySport: Record<string, number>
  workoutsPerWeek: number
  streak: number
  longestStreak: number
  lastWorkout: string | null
  personalRecords: Array<{
    exerciseId: string
    exerciseName: string
    metric: string
    value: number
    date: string
  }>
}

type StatsResponse = {
  period: string
  stats: WorkoutStats
}

type Workout = {
  id: string
  completedAt: string
  duration: number | null
  sport: string
}

type WorkoutsResponse = {
  workouts: Workout[]
  total: number
  page: number
  totalPages: number
}

export function ProgressDashboard() {
  const [period, setPeriod] = useState<Period>("month")
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch stats
        const statsResponse = await fetch(`/api/workouts/stats?period=${period}`)
        if (statsResponse.ok) {
          const statsData: StatsResponse = await statsResponse.json()
          setStats(statsData.stats)
        }

        // Fetch workouts for charts
        const now = new Date()
        let fromDate: Date
        switch (period) {
          case "week":
            fromDate = new Date(now)
            fromDate.setDate(now.getDate() - 7)
            break
          case "month":
            fromDate = new Date(now)
            fromDate.setMonth(now.getMonth() - 1)
            break
          case "year":
            fromDate = new Date(now)
            fromDate.setFullYear(now.getFullYear() - 1)
            break
          default:
            fromDate = new Date(0)
        }

        const workoutsResponse = await fetch(
          `/api/workouts?from=${fromDate.toISOString()}&limit=1000`
        )
        if (workoutsResponse.ok) {
          const workoutsData: WorkoutsResponse = await workoutsResponse.json()
          setWorkouts(workoutsData.workouts)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [period])

  // Transform workouts for charts
  const workoutsPerWeekData = (() => {
    const weekMap = new Map<string, number>()
    workouts.forEach((workout) => {
      const date = new Date(workout.completedAt)
      const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`
      weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1)
    })
    return Array.from(weekMap.entries())
      .map(([week, count]) => ({
        date: week,
        value: count,
        label: week,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  })()

  const durationOverTimeData = workouts
    .filter((w) => w.duration !== null)
    .map((workout) => ({
      date: workout.completedAt,
      value: workout.duration!,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const workoutsBySportData = stats
    ? Object.entries(stats.workoutsBySport).map(([sport, count]) => ({
        date: sport,
        value: count,
        label: sport,
      }))
    : []

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins : ""}`
    }
    return `${mins}min`
  }

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  }

  const sportLabels: Record<string, string> = {
    running: "Course",
    swimming: "Natation",
    cycling: "Cyclisme",
    strength: "Musculation",
    other: "Autre",
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {(["week", "month", "year", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              period === p
                ? "bg-blue-600 text-white"
                : "bg-gray-900 text-white border border-gray-800 hover:bg-gray-950"
            }`}
          >
            {p === "week"
              ? "Semaine"
              : p === "month"
              ? "Mois"
              : p === "year"
              ? "Année"
              : "Tout"}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-lg shadow-md border border-gray-800 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total entraînements"
            value={stats.totalWorkouts}
            subtitle={`${period === "week" ? "cette semaine" : period === "month" ? "ce mois" : period === "year" ? "cette année" : "au total"}`}
          />
          <StatsCard
            title="Temps total"
            value={formatDuration(stats.totalDuration)}
            subtitle={`${period === "week" ? "cette semaine" : period === "month" ? "ce mois" : period === "year" ? "cette année" : "au total"}`}
          />
          <StatsCard
            title="Durée moyenne"
            value={formatDuration(Math.round(stats.averageDuration))}
            subtitle="par entraînement"
          />
          <StatsCard
            title="Série actuelle"
            value={stats.streak}
            subtitle="jours consécutifs"
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutChart
          type="bar"
          data={workoutsPerWeekData}
          title="Entraînements par semaine"
          yAxisLabel="Nombre"
          isLoading={isLoading}
        />
        <WorkoutChart
          type="line"
          data={durationOverTimeData}
          title="Durée au fil du temps"
          yAxisLabel="Minutes"
          isLoading={isLoading}
        />
        <WorkoutChart
          type="bar"
          data={workoutsBySportData}
          title="Entraînements par sport"
          yAxisLabel="Nombre"
          isLoading={isLoading}
        />
      </div>

      {/* Personal Records */}
      {stats && stats.personalRecords.length > 0 && (
        <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Records personnels récents
          </h3>
          <div className="space-y-3">
            {stats.personalRecords.slice(0, 5).map((pr, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-950 rounded-md"
              >
                <div>
                  <p className="font-medium text-white">{pr.exerciseName}</p>
                  <p className="text-sm text-gray-400">
                    {pr.metric === "weight"
                      ? "Poids max"
                      : pr.metric === "reps"
                      ? "Répétitions max"
                      : pr.metric === "duration"
                      ? "Durée max"
                      : "Distance max"}
                    : {pr.value}
                    {pr.metric === "weight" ? " kg" : pr.metric === "duration" ? " s" : pr.metric === "distance" ? " m" : ""}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(pr.date).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link to full history */}
      <div className="text-center">
        <Link
          href="/workouts"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Voir l&apos;historique complet
        </Link>
      </div>
    </div>
  )
}


