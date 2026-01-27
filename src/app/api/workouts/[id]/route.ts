import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { id } = await context.params

  const workout = await prisma.workoutLog.findUnique({
    where: { id },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
        orderBy: { order: "asc" },
      },
      session: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      program: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  })

  if (!workout) {
    return NextResponse.json(
      { error: "Workout not found" },
      { status: 404 }
    )
  }

  if (workout.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  return NextResponse.json(workout)
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { id } = await context.params

  const existingWorkout = await prisma.workoutLog.findUnique({
    where: { id },
  })

  if (!existingWorkout) {
    return NextResponse.json(
      { error: "Workout not found" },
      { status: 404 }
    )
  }

  if (existingWorkout.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  let body: {
    name?: string
    sport?: string
    duration?: number | null
    completedAt?: string
    notes?: string | null
    rating?: number | null
    exercises?: {
      exerciseId: string
      order?: number
      plannedSets?: number | null
      plannedReps?: number | null
      actualSets?: number | null
      actualReps?: string | null
      weight?: number | null
      duration?: number | null
      distance?: number | null
      notes?: string | null
    }[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const { name, sport, duration, completedAt, notes, rating, exercises } = body

  // Use transaction to update workout and replace exercises atomically
  const updatedWorkout = await prisma.$transaction(async (tx) => {
    // Update workout fields
    const updated = await tx.workoutLog.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(sport !== undefined && { sport: sport.trim() }),
        ...(duration !== undefined && { duration }),
        ...(completedAt !== undefined && { completedAt: new Date(completedAt) }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(rating !== undefined && { rating: rating && rating >= 1 && rating <= 5 ? rating : null }),
      },
    })

    // If exercises array provided, replace all WorkoutExercise records
    if (exercises !== undefined) {
      // Delete existing exercises
      await tx.workoutExercise.deleteMany({
        where: { workoutLogId: id },
      })

      // Create new exercises if any
      if (exercises.length > 0) {
        await tx.workoutExercise.createMany({
          data: exercises.map((ex, index) => ({
            workoutLogId: id,
            exerciseId: ex.exerciseId,
            order: ex.order ?? index,
            plannedSets: ex.plannedSets ?? null,
            plannedReps: ex.plannedReps ?? null,
            actualSets: ex.actualSets ?? null,
            actualReps: ex.actualReps || null,
            weight: ex.weight ?? null,
            duration: ex.duration ?? null,
            distance: ex.distance ?? null,
            notes: ex.notes?.trim() || null,
          })),
        })
      }
    }

    // Fetch updated workout with all relations
    return tx.workoutLog.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: "asc" },
        },
        session: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })
  })

  return NextResponse.json(updatedWorkout)
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { id } = await context.params

  const existingWorkout = await prisma.workoutLog.findUnique({
    where: { id },
  })

  if (!existingWorkout) {
    return NextResponse.json(
      { error: "Workout not found" },
      { status: 404 }
    )
  }

  if (existingWorkout.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  // Delete workout (cascades to WorkoutExercise via schema)
  await prisma.workoutLog.delete({
    where: { id },
  })

  return new NextResponse(null, { status: 204 })
}

