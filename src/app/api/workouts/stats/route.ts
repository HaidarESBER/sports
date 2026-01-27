import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "month"
  const sport = searchParams.get("sport")

  // Calculate date range based on period
  const now = new Date()
  let startDate: Date

  switch (period) {
    case "week":
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
      break
    case "year":
      startDate = new Date(now)
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case "all":
    default:
      startDate = new Date(0) // Beginning of time
      break
  }

  // Build where clause
  const where: any = {
    userId: session.user.id,
    ...(sport && { sport }),
    ...(period !== "all" && {
      completedAt: {
        gte: startDate,
      },
    }),
  }

  // Get all workouts in period for calculations
  const workouts = await prisma.workoutLog.findMany({
    where,
    select: {
      id: true,
      completedAt: true,
      duration: true,
      sport: true,
      exercises: {
        select: {
          exerciseId: true,
          exercise: {
            select: {
              id: true,
              name: true,
            },
          },
          weight: true,
          actualReps: true,
          duration: true,
          distance: true,
          actualSets: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
  })

  // Basic stats
  const totalWorkouts = workouts.length
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0)
  const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0

  // Workouts by sport
  const workoutsBySport: Record<string, number> = {}
  workouts.forEach((w) => {
    workoutsBySport[w.sport] = (workoutsBySport[w.sport] || 0) + 1
  })

  // Workouts per week
  const daysDiff = period === "all" 
    ? Math.max(1, Math.floor((now.getTime() - (workouts[workouts.length - 1]?.completedAt.getTime() || now.getTime())) / (1000 * 60 * 60 * 24)))
    : Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  const weeks = daysDiff / 7
  const workoutsPerWeek = weeks > 0 ? totalWorkouts / weeks : 0

  // Calculate streaks
  // Get all workout dates (unique days) sorted descending
  const workoutDates = Array.from(
    new Set(
      workouts.map((w) => {
        const date = new Date(w.completedAt)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
    )
  ).sort((a, b) => b - a)

  // Current streak (consecutive days from today backwards)
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  // Check if there's a workout today or yesterday
  let checkDate = new Date(today)
  let checkTime = checkDate.getTime()

  // If no workout today, start from yesterday
  if (!workoutDates.includes(todayTime)) {
    checkDate.setDate(checkDate.getDate() - 1)
    checkTime = checkDate.getTime()
  }

  // Count consecutive days
  for (let i = 0; i < workoutDates.length; i++) {
    if (workoutDates[i] === checkTime) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
      checkTime = checkDate.getTime()
    } else if (workoutDates[i] < checkTime) {
      // Gap found, stop counting
      break
    }
  }

  // Longest streak (all time, not just period)
  const allWorkouts = await prisma.workoutLog.findMany({
    where: {
      userId: session.user.id,
      ...(sport && { sport }),
    },
    select: {
      completedAt: true,
    },
    orderBy: { completedAt: "desc" },
  })

  const allWorkoutDates = Array.from(
    new Set(
      allWorkouts.map((w) => {
        const date = new Date(w.completedAt)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
    )
  ).sort((a, b) => b - a)

  let longestStreak = 0
  if (allWorkoutDates.length > 0) {
    let currentStreak = 1
    let maxStreak = 1

    for (let i = 0; i < allWorkoutDates.length - 1; i++) {
      const currentDate = new Date(allWorkoutDates[i])
      const nextDate = new Date(allWorkoutDates[i + 1])
      const daysDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        // Consecutive day
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        // Gap found, reset
        currentStreak = 1
      }
    }

    longestStreak = maxStreak
  }

  // Last workout
  const lastWorkout = workouts.length > 0 ? workouts[0].completedAt : null

  // Personal Records (PRs)
  // Track max weight, max reps, max duration, max distance per exercise
  const prs: Array<{
    exerciseId: string
    exerciseName: string
    metric: string
    value: number
    date: Date
  }> = []

  // Group exercises by exerciseId
  const exerciseData: Record<
    string,
    {
      name: string
      maxWeight: { value: number; date: Date } | null
      maxReps: { value: number; date: Date } | null
      maxDuration: { value: number; date: Date } | null
      maxDistance: { value: number; date: Date } | null
    }
  > = {}

  workouts.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      if (!exerciseData[ex.exerciseId]) {
        exerciseData[ex.exerciseId] = {
          name: ex.exercise.name,
          maxWeight: null,
          maxReps: null,
          maxDuration: null,
          maxDistance: null,
        }
      }

      const data = exerciseData[ex.exerciseId]

      // Max weight
      if (ex.weight !== null && ex.weight !== undefined) {
        if (!data.maxWeight || ex.weight > data.maxWeight.value) {
          data.maxWeight = { value: ex.weight, date: workout.completedAt }
        }
      }

      // Max reps (parse actualReps if it's a JSON array, or use actualSets * reps)
      if (ex.actualReps) {
        try {
          // Try parsing as JSON array
          const repsArray = JSON.parse(ex.actualReps)
          if (Array.isArray(repsArray)) {
            const totalReps = repsArray.reduce((sum: number, r: number) => sum + r, 0)
            if (!data.maxReps || totalReps > data.maxReps.value) {
              data.maxReps = { value: totalReps, date: workout.completedAt }
            }
          }
        } catch {
          // Not JSON, try parsing as number
          const repsNum = parseFloat(ex.actualReps)
          if (!isNaN(repsNum)) {
            if (!data.maxReps || repsNum > data.maxReps.value) {
              data.maxReps = { value: repsNum, date: workout.completedAt }
            }
          }
        }
      } else if (ex.actualSets && ex.actualSets > 0) {
        // Fallback: use sets as proxy (not ideal but better than nothing)
        if (!data.maxReps || ex.actualSets > data.maxReps.value) {
          data.maxReps = { value: ex.actualSets, date: workout.completedAt }
        }
      }

      // Max duration
      if (ex.duration !== null && ex.duration !== undefined) {
        if (!data.maxDuration || ex.duration > data.maxDuration.value) {
          data.maxDuration = { value: ex.duration, date: workout.completedAt }
        }
      }

      // Max distance
      if (ex.distance !== null && ex.distance !== undefined) {
        if (!data.maxDistance || ex.distance > data.maxDistance.value) {
          data.maxDistance = { value: ex.distance, date: workout.completedAt }
        }
      }
    })
  })

  // Convert exercise data to PR array
  Object.entries(exerciseData).forEach(([exerciseId, data]) => {
    if (data.maxWeight) {
      prs.push({
        exerciseId,
        exerciseName: data.name,
        metric: "weight",
        value: data.maxWeight.value,
        date: data.maxWeight.date,
      })
    }
    if (data.maxReps) {
      prs.push({
        exerciseId,
        exerciseName: data.name,
        metric: "reps",
        value: data.maxReps.value,
        date: data.maxReps.date,
      })
    }
    if (data.maxDuration) {
      prs.push({
        exerciseId,
        exerciseName: data.name,
        metric: "duration",
        value: data.maxDuration.value,
        date: data.maxDuration.date,
      })
    }
    if (data.maxDistance) {
      prs.push({
        exerciseId,
        exerciseName: data.name,
        metric: "distance",
        value: data.maxDistance.value,
        date: data.maxDistance.date,
      })
    }
  })

  // Sort PRs by date (most recent first)
  prs.sort((a, b) => b.date.getTime() - a.date.getTime())

  return NextResponse.json({
    period,
    stats: {
      totalWorkouts,
      totalDuration,
      averageDuration: Math.round(averageDuration * 10) / 10, // Round to 1 decimal
      workoutsBySport,
      workoutsPerWeek: Math.round(workoutsPerWeek * 10) / 10, // Round to 1 decimal
      streak,
      longestStreak,
      lastWorkout,
      personalRecords: prs,
    },
  })
}

