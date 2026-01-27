import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  const session = await auth()
  const { id: sessionId } = await context.params

  // Check if session exists and author is public
  const trainingSession = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      author: {
        select: {
          id: true,
          isPublic: true,
        },
      },
    },
  })

  if (!trainingSession) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    )
  }

  // Check if user can view (author is public or user is owner)
  const canView =
    trainingSession.author.isPublic ||
    trainingSession.authorId === session?.user?.id
  if (!canView) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    )
  }

  // Get like count
  const likesCount = await prisma.like.count({
    where: { sessionId },
  })

  // Check if current user liked it
  let isLiked = false
  if (session?.user?.id) {
    const like = await prisma.like.findUnique({
      where: {
        userId_sessionId: {
          userId: session.user.id,
          sessionId,
        },
      },
    })
    isLiked = !!like
  }

  return NextResponse.json({
    isLiked,
    likesCount,
  })
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { id: sessionId } = await context.params

  // Check if session exists and author is public (or user is owner)
  const trainingSession = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      author: {
        select: {
          id: true,
          isPublic: true,
        },
      },
    },
  })

  if (!trainingSession) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    )
  }

  const userId = session.user.id
  const canLike =
    trainingSession.author.isPublic ||
    trainingSession.authorId === userId
  if (!canLike) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    )
  }

  // Check if already liked
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_sessionId: {
        userId,
        sessionId,
      },
    },
  })

  if (existingLike) {
    return NextResponse.json(
      { error: "Already liked" },
      { status: 400 }
    )
  }

  // Create like and activity in transaction
  await prisma.$transaction(async (tx) => {
    // Create like
    await tx.like.create({
      data: {
        userId,
        sessionId,
      },
    })

    // Create activity
    await tx.activity.create({
      data: {
        type: "like_session",
        userId,
        sessionId,
      },
    })
  })

  // Get updated like count
  const likesCount = await prisma.like.count({
    where: { sessionId },
  })

  return NextResponse.json({
    success: true,
    isLiked: true,
    likesCount,
  })
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { id: sessionId } = await context.params
  const userId = session.user.id

  // Find existing like
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_sessionId: {
        userId,
        sessionId,
      },
    },
  })

  if (!existingLike) {
    return NextResponse.json(
      { error: "Not liked" },
      { status: 404 }
    )
  }

  // Delete like
  await prisma.like.delete({
    where: { id: existingLike.id },
  })

  // Get updated like count
  const likesCount = await prisma.like.count({
    where: { sessionId },
  })

  return NextResponse.json({
    success: true,
    isLiked: false,
    likesCount,
  })
}

