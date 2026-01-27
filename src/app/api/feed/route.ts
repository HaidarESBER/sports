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

  // Parse pagination params
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  // Get list of user IDs the current user follows
  const follows = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  })

  const followingIds = follows.map((f) => f.followingId)

  if (followingIds.length === 0) {
    return NextResponse.json({
      activities: [],
      total: 0,
      page: 1,
      totalPages: 0,
    })
  }

  // Build where clause for activities from followed users
  const where: any = {
    userId: {
      in: followingIds,
    },
  }

  // Get total count
  const total = await prisma.activity.count({ where })

  // Get activities with related data
  const activities = await prisma.activity.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      program: {
        select: {
          id: true,
          name: true,
          sport: true,
          isPublic: true,
        },
      },
      session: {
        select: {
          id: true,
          name: true,
          sport: true,
          author: {
            select: {
              id: true,
              isPublic: true,
            },
          },
        },
      },
      targetUser: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  })

  // Filter to only public content
  const filteredActivities = activities.filter((activity) => {
    // For program activities, check if program is public
    if (activity.programId) {
      return activity.program?.isPublic === true
    }

    // For session activities, check if author is public
    if (activity.sessionId) {
      return activity.session?.author?.isPublic === true
    }

    // For follow activities, always show (targetUser is public by default in discovery)
    if (activity.type === "follow") {
      return true
    }

    return true
  })

  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({
    activities: filteredActivities,
    total: filteredActivities.length,
    page,
    totalPages,
  })
}

