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

  const trainingSession = await prisma.session.findUnique({
    where: { id },
    include: {
      exercises: {
        include: {
          exercise: true
        },
        orderBy: { order: "asc" }
      }
    }
  })

  if (!trainingSession) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    )
  }

  if (trainingSession.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  return NextResponse.json(trainingSession)
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

  const existingSession = await prisma.session.findUnique({
    where: { id }
  })

  if (!existingSession) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    )
  }

  if (existingSession.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  let body: {
    name?: string
    description?: string
    sport?: string
    estimatedDuration?: number | null
    exercises?: {
      exerciseId: string
      order?: number
      sets?: number | null
      reps?: number | null
      duration?: number | null
      distance?: number | null
      intensity?: string | null
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

  const { name, description, sport, estimatedDuration, exercises } = body

  // Use transaction to update session and replace exercises atomically
  const updatedSession = await prisma.$transaction(async (tx) => {
    // Update session fields
    const updated = await tx.session.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(sport !== undefined && { sport: sport.trim() }),
        ...(estimatedDuration !== undefined && { estimatedDuration })
      }
    })

    // If exercises array provided, replace all SessionExercise records
    if (exercises !== undefined) {
      // Delete existing exercises
      await tx.sessionExercise.deleteMany({
        where: { sessionId: id }
      })

      // Create new exercises if any
      if (exercises.length > 0) {
        await tx.sessionExercise.createMany({
          data: exercises.map((ex, index) => ({
            sessionId: id,
            exerciseId: ex.exerciseId,
            order: ex.order ?? index,
            sets: ex.sets ?? null,
            reps: ex.reps ?? null,
            duration: ex.duration ?? null,
            distance: ex.distance ?? null,
            intensity: ex.intensity ?? null,
            notes: ex.notes ?? null
          }))
        })
      }
    }

    // Fetch updated session with exercises
    return tx.session.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            exercise: true
          },
          orderBy: { order: "asc" }
        }
      }
    })
  })

  return NextResponse.json(updatedSession)
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

  const existingSession = await prisma.session.findUnique({
    where: { id }
  })

  if (!existingSession) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    )
  }

  if (existingSession.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  // Delete session (cascades to SessionExercise via schema)
  await prisma.session.delete({
    where: { id }
  })

  return new NextResponse(null, { status: 204 })
}
