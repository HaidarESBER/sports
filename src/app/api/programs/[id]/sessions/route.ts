import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

type RouteContext = {
  params: Promise<{ id: string }>
}

type SessionAssignment = {
  sessionId: string
  weekNumber: number
  dayOfWeek: number
  order?: number
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

  const existingProgram = await prisma.program.findUnique({
    where: { id }
  })

  if (!existingProgram) {
    return NextResponse.json(
      { error: "Program not found" },
      { status: 404 }
    )
  }

  if (existingProgram.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  let body: {
    sessions?: SessionAssignment[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const { sessions: sessionAssignments } = body

  if (!Array.isArray(sessionAssignments)) {
    return NextResponse.json(
      { error: "Sessions must be an array" },
      { status: 400 }
    )
  }

  // Validate all session assignments
  for (const assignment of sessionAssignments) {
    if (!assignment.sessionId || typeof assignment.sessionId !== "string") {
      return NextResponse.json(
        { error: "Each session assignment must have a sessionId" },
        { status: 400 }
      )
    }

    if (typeof assignment.weekNumber !== "number" || assignment.weekNumber < 1 || assignment.weekNumber > existingProgram.durationWeeks) {
      return NextResponse.json(
        { error: `weekNumber must be between 1 and ${existingProgram.durationWeeks}` },
        { status: 400 }
      )
    }

    if (typeof assignment.dayOfWeek !== "number" || assignment.dayOfWeek < 1 || assignment.dayOfWeek > 7) {
      return NextResponse.json(
        { error: "dayOfWeek must be between 1 and 7" },
        { status: 400 }
      )
    }
  }

  // Verify all sessions exist and belong to user
  const sessionIds = sessionAssignments.map(a => a.sessionId)
  const existingSessions = await prisma.session.findMany({
    where: {
      id: { in: sessionIds },
      authorId: session.user.id
    },
    select: { id: true }
  })

  const existingSessionIds = new Set(existingSessions.map(s => s.id))
  const invalidSessionIds = sessionIds.filter(id => !existingSessionIds.has(id))

  if (invalidSessionIds.length > 0) {
    return NextResponse.json(
      { error: `Sessions not found or not owned by user: ${invalidSessionIds.join(", ")}` },
      { status: 400 }
    )
  }

  // Use transaction to atomically replace all ProgramSession records
  const updatedProgram = await prisma.$transaction(async (tx) => {
    // Delete all existing ProgramSession records for this program
    await tx.programSession.deleteMany({
      where: { programId: id }
    })

    // Create new ProgramSession records if any
    if (sessionAssignments.length > 0) {
      await tx.programSession.createMany({
        data: sessionAssignments.map((assignment, index) => ({
          programId: id,
          sessionId: assignment.sessionId,
          weekNumber: assignment.weekNumber,
          dayOfWeek: assignment.dayOfWeek,
          order: assignment.order ?? index
        }))
      })
    }

    // Fetch updated program with sessions
    return tx.program.findUnique({
      where: { id },
      include: {
        programSessions: {
          include: {
            session: true
          },
          orderBy: [
            { weekNumber: "asc" },
            { dayOfWeek: "asc" },
            { order: "asc" }
          ]
        }
      }
    })
  })

  return NextResponse.json(updatedProgram)
}
