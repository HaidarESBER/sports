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
  const { id: programId } = await context.params

  // Check if program exists and is public
  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: {
      id: true,
      isPublic: true,
      authorId: true,
    },
  })

  if (!program) {
    return NextResponse.json(
      { error: "Program not found" },
      { status: 404 }
    )
  }

  // Check if user can view (public or owner)
  const canView = program.isPublic || program.authorId === session?.user?.id
  if (!canView) {
    return NextResponse.json(
      { error: "Program not found" },
      { status: 404 }
    )
  }

  // Get like count
  const likesCount = await prisma.like.count({
    where: { programId },
  })

  // Check if current user liked it
  let isLiked = false
  if (session?.user?.id) {
    const like = await prisma.like.findUnique({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId,
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

  const { id: programId } = await context.params

  // Check if program exists and is public (or user is owner)
  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: {
      id: true,
      isPublic: true,
      authorId: true,
    },
  })

  if (!program) {
    return NextResponse.json(
      { error: "Program not found" },
      { status: 404 }
    )
  }

  const userId = session.user.id
  const canLike = program.isPublic || program.authorId === userId
  if (!canLike) {
    return NextResponse.json(
      { error: "Program not found" },
      { status: 404 }
    )
  }

  // Check if already liked
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_programId: {
        userId,
        programId,
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
        programId,
      },
    })

    // Create activity
    await tx.activity.create({
      data: {
        type: "like_program",
        userId,
        programId,
      },
    })
  })

  // Get updated like count
  const likesCount = await prisma.like.count({
    where: { programId },
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

  const { id: programId } = await context.params
  const userId = session.user.id

  // Find existing like
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_programId: {
        userId,
        programId,
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
    where: { programId },
  })

  return NextResponse.json({
    success: true,
    isLiked: false,
    likesCount,
  })
}

