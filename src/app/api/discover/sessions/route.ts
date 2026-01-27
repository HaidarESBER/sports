import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  // Public endpoint - no auth required
  const { searchParams } = new URL(request.url)

  // Parse search and filter params
  const search = searchParams.get("search")
  const sport = searchParams.get("sport")
  const minDuration = searchParams.get("minDuration")
  const maxDuration = searchParams.get("maxDuration")

  // Parse pagination params
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  // Build where clause - only sessions from public users
  const where = {
    author: {
      isPublic: true,
    },
    ...(sport && { sport }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    }),
    ...(minDuration || maxDuration ? {
      estimatedDuration: {
        ...(minDuration && { gte: parseInt(minDuration, 10) }),
        ...(maxDuration && { lte: parseInt(maxDuration, 10) }),
      },
    } : {}),
  }

  // Get total count
  const total = await prisma.session.count({ where })

  // Get sessions with author info and exercise count
  const sessions = await prisma.session.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: { exercises: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  })

  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({
    sessions,
    total,
    page,
    totalPages,
  })
}
