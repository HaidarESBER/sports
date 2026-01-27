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

  // Parse filter params
  const sport = searchParams.get("sport")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const sessionId = searchParams.get("sessionId")
  const programId = searchParams.get("programId")

  // Parse pagination params
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {
    userId: session.user.id,
    ...(sport && { sport }),
    ...(sessionId && { sessionId }),
    ...(programId && { programId }),
    ...(from || to ? {
      completedAt: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      },
    } : {}),
  }

  // Get total count
  const total = await prisma.workoutLog.count({ where })

  // Get workouts with exercises and related info
  const workouts = await prisma.workoutLog.findMany({
    where,
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
        },
      },
      program: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
    skip,
    take: limit,
  })

  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({
    workouts,
    total,
    page,
    totalPages,
  })
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  let body: {
    sessionId?: string
    programId?: string
    name?: string
    sport?: string
    duration?: number
    completedAt?: string
    notes?: string
    rating?: number
    exercises?: {
      exerciseId: string
      order?: number
      plannedSets?: number
      plannedReps?: number
      actualSets?: number
      actualReps?: string
      weight?: number
      duration?: number
      distance?: number
      notes?: string
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

  const { sessionId, programId, name, sport, duration, completedAt, notes, rating, exercises } = body

  // If sessionId provided, fetch session to auto-fill name/sport and planned values
  let sessionData: { name: string; sport: string; exercises?: any[] } | null = null
  if (sessionId) {
    const templateSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!templateSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Check ownership if session is provided
    const userId = session.user.id
    if (templateSession.authorId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    sessionData = {
      name: templateSession.name,
      sport: templateSession.sport,
      exercises: templateSession.exercises,
    }
  }

  // Validate required fields
  const workoutName = name || sessionData?.name
  const workoutSport = sport || sessionData?.sport

  if (!workoutName || typeof workoutName !== "string" || workoutName.trim().length === 0) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    )
  }

  if (!workoutSport || typeof workoutSport !== "string" || workoutSport.trim().length === 0) {
    return NextResponse.json(
      { error: "Sport is required" },
      { status: 400 }
    )
  }

  // If programId provided, validate ownership
  if (programId) {
    const program = await prisma.program.findUnique({
      where: { id: programId },
    })

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      )
    }

    const userId = session.user.id
    if (program.authorId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }
  }

  const userId = session.user.id

  // Create workout with exercises in transaction
  const workout = await prisma.$transaction(async (tx) => {
    const workoutLog = await tx.workoutLog.create({
      data: {
        userId,
        sessionId: sessionId || null,
        programId: programId || null,
        name: workoutName.trim(),
        sport: workoutSport.trim(),
        duration: duration ?? null,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        notes: notes?.trim() || null,
        rating: rating && rating >= 1 && rating <= 5 ? rating : null,
      },
    })

    // Create exercises if provided
    if (exercises && exercises.length > 0) {
      await tx.workoutExercise.createMany({
        data: exercises.map((ex, index) => ({
          workoutLogId: workoutLog.id,
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
    } else if (sessionData?.exercises && sessionData.exercises.length > 0) {
      // Auto-fill from session template if no exercises provided
      await tx.workoutExercise.createMany({
        data: sessionData.exercises.map((ex, index) => ({
          workoutLogId: workoutLog.id,
          exerciseId: ex.exerciseId,
          order: ex.order ?? index,
          plannedSets: ex.sets ?? null,
          plannedReps: ex.reps ?? null,
          actualSets: null,
          actualReps: null,
          weight: null,
          duration: ex.duration ?? null,
          distance: ex.distance ?? null,
          notes: ex.notes?.trim() || null,
        })),
      })
    }

    // Fetch created workout with all relations
    return tx.workoutLog.findUnique({
      where: { id: workoutLog.id },
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
          },
        },
        program: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  })

  return NextResponse.json(workout, { status: 201 })
}

