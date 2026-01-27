import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: targetUserId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const currentUserId = session.user.id

  // Cannot follow yourself
  if (currentUserId === targetUserId) {
    return NextResponse.json(
      { error: "Cannot follow yourself" },
      { status: 400 }
    )
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true }
  })

  if (!targetUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      }
    }
  })

  if (existingFollow) {
    return NextResponse.json(
      { error: "Already following this user" },
      { status: 400 }
    )
  }

  // Create follow relationship
  await prisma.follow.create({
    data: {
      followerId: currentUserId,
      followingId: targetUserId,
    }
  })

  return NextResponse.json({
    success: true,
    isFollowing: true,
  })
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id: targetUserId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const currentUserId = session.user.id

  // Find existing follow relationship
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      }
    }
  })

  if (!existingFollow) {
    return NextResponse.json(
      { error: "Not following this user" },
      { status: 404 }
    )
  }

  // Delete follow relationship
  await prisma.follow.delete({
    where: { id: existingFollow.id }
  })

  return NextResponse.json({
    success: true,
    isFollowing: false,
  })
}
