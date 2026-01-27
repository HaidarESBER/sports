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

  const program = await prisma.program.findUnique({
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

  if (!program) {
    return NextResponse.json(
      { error: "Program not found" },
      { status: 404 }
    )
  }

  if (program.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  return NextResponse.json(program)
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
    name?: string
    description?: string
    sport?: string
    durationWeeks?: number
    difficulty?: string
    isPublic?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const { name, description, sport, durationWeeks, difficulty, isPublic } = body

  const updatedProgram = await prisma.program.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(sport !== undefined && { sport: sport.trim() }),
      ...(durationWeeks !== undefined && { durationWeeks }),
      ...(difficulty !== undefined && { difficulty: difficulty?.trim() || null }),
      ...(isPublic !== undefined && { isPublic })
    },
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

  return NextResponse.json(updatedProgram)
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

  // Delete program (cascades to ProgramSession via schema)
  await prisma.program.delete({
    where: { id }
  })

  return new NextResponse(null, { status: 204 })
}
