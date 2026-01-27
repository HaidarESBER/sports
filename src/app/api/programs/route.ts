import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const programs = await prisma.program.findMany({
    where: { authorId: session.user.id },
    include: {
      programSessions: {
        include: {
          session: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  })

  return NextResponse.json(programs)
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

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    )
  }

  if (!sport || typeof sport !== "string" || sport.trim().length === 0) {
    return NextResponse.json(
      { error: "Sport is required" },
      { status: 400 }
    )
  }

  if (durationWeeks === undefined || typeof durationWeeks !== "number" || durationWeeks < 1) {
    return NextResponse.json(
      { error: "Duration weeks is required and must be at least 1" },
      { status: 400 }
    )
  }

  const newProgram = await prisma.program.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      sport: sport.trim(),
      durationWeeks,
      difficulty: difficulty?.trim() || null,
      isPublic: isPublic ?? false,
      authorId: session.user.id
    },
    include: {
      programSessions: {
        include: {
          session: true
        }
      }
    }
  })

  return NextResponse.json(newProgram, { status: 201 })
}
