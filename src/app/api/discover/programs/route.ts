import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  // Public endpoint - no auth required
  const { searchParams } = new URL(request.url)

  // Parse search and filter params
  const search = searchParams.get("search")
  const sport = searchParams.get("sport")
  const difficulty = searchParams.get("difficulty")
  const minWeeks = searchParams.get("minWeeks")
  const maxWeeks = searchParams.get("maxWeeks")

  // Parse pagination params
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  // Build where clause
  const where = {
    isPublic: true,
    ...(sport && { sport }),
    ...(difficulty && { difficulty }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    }),
    ...(minWeeks || maxWeeks ? {
      durationWeeks: {
        ...(minWeeks && { gte: parseInt(minWeeks, 10) }),
        ...(maxWeeks && { lte: parseInt(maxWeeks, 10) }),
      },
    } : {}),
  }

  // Get total count
  const total = await prisma.program.count({ where })

  // Get programs with author info and session count
  const programs = await prisma.program.findMany({
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
        select: { programSessions: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  })

  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({
    programs,
    total,
    page,
    totalPages,
  })
}
