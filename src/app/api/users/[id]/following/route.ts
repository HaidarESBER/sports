import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id: userId } = await params
  const session = await auth()
  const viewerId = session?.user?.id

  // Check if user exists and get visibility
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isPublic: true }
  })

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Check if viewer can access following list
  const isOwner = viewerId === userId
  if (!user.isPublic && !isOwner) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Parse pagination params
  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  // Get total count
  const total = await prisma.follow.count({
    where: { followerId: userId }
  })

  // Get following (users this user follows)
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  })

  const following = follows.map(f => f.following)
  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({
    following,
    total,
    page,
    totalPages,
  })
}
