import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  // Public endpoint - no auth required
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get("sport")
  const search = searchParams.get("search")

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(sport && { sport }),
      ...(search && {
        name: {
          contains: search
        }
      })
    },
    orderBy: { name: "asc" },
    take: 50
  })

  return NextResponse.json(exercises)
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
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const { name, description, sport } = body

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

  // Check for duplicate: existing exercise with same name AND sport
  const existingExercise = await prisma.exercise.findFirst({
    where: {
      name: name.trim(),
      sport: sport.trim()
    }
  })

  if (existingExercise) {
    return NextResponse.json(
      { error: "An exercise with this name and sport already exists" },
      { status: 409 }
    )
  }

  const newExercise = await prisma.exercise.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      sport: sport.trim()
    }
  })

  return NextResponse.json(newExercise, { status: 201 })
}
