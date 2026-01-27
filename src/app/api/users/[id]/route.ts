import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const session = await auth()
  const viewerId = session?.user?.id

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      location: true,
      isPublic: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          programs: {
            where: { isPublic: true }
          },
          sessions: true,
        }
      }
    }
  })

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Check if viewer can access this profile
  const isOwner = viewerId === user.id
  if (!user.isPublic && !isOwner) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Check if viewer is following this user
  let isFollowing = false
  if (viewerId && viewerId !== user.id) {
    const followRecord = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewerId,
          followingId: user.id,
        }
      }
    })
    isFollowing = !!followRecord
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    image: user.image,
    bio: user.bio,
    location: user.location,
    isPublic: user.isPublic,
    createdAt: user.createdAt,
    stats: {
      followers: user._count.followers,
      following: user._count.following,
      programs: user._count.programs,
      sessions: user._count.sessions,
    },
    isFollowing,
  })
}
