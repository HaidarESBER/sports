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

  const sessions = await prisma.session.findMany({
    where: { authorId: session.user.id },
    include: {
      exercises: {
        include: {
          exercise: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  })

  return NextResponse.json(sessions)
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
    estimatedDuration?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const { name, description, sport, estimatedDuration } = body

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

  const newSession = await prisma.session.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      sport: sport.trim(),
      estimatedDuration: estimatedDuration ?? null,
      authorId: session.user.id
    },
    include: {
      exercises: {
        include: {
          exercise: true
        }
      }
    }
  })

  return NextResponse.json(newSession, { status: 201 })
}
