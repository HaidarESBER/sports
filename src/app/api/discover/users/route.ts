import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  // Public endpoint - no auth required, but check for viewer to add isFollowing
  const session = await auth()
  const viewerId = session?.user?.id

  const { searchParams } = new URL(request.url)

  // Parse search param
  const search = searchParams.get("search")

  // Parse pagination params
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  // Build where clause - only public users
  const where = {
    isPublic: true,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { bio: { contains: search } },
      ],
    }),
  }

  // Get total count
  const total = await prisma.user.count({ where })

  // Get users with counts
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      location: true,
      _count: {
        select: {
          programs: {
            where: { isPublic: true },
          },
          followers: true,
          following: true,
        },
      },
    },
    orderBy: [
      { followers: { _count: "desc" } },
      { name: "asc" },
    ],
    skip,
    take: limit,
  })

  // If viewer is authenticated, add isFollowing to each user
  let usersWithFollowing = users.map(user => ({
    ...user,
    isFollowing: false,
  }))

  if (viewerId) {
    const userIds = users.map(u => u.id)
    const followingRelations = await prisma.follow.findMany({
      where: {
        followerId: viewerId,
        followingId: { in: userIds },
      },
      select: { followingId: true },
    })
    const followingSet = new Set(followingRelations.map(f => f.followingId))

    usersWithFollowing = users.map(user => ({
      ...user,
      isFollowing: followingSet.has(user.id),
    }))
  }

  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({
    users: usersWithFollowing,
    total,
    page,
    totalPages,
  })
}
