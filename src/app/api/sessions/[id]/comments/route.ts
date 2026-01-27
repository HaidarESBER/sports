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
  const { searchParams } = new URL(request.url)

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

  // Parse pagination params
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  // Get total count
  const total = await prisma.comment.count({
    where: { sessionId },
  })

  // Get comments
  const comments = await prisma.comment.findMany({
    where: { sessionId },
    include: {
      user: {
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

  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({
    comments,
    total,
    page,
    totalPages,
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
  const canComment =
    trainingSession.author.isPublic ||
    trainingSession.authorId === userId
  if (!canComment) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    )
  }

  let body: { content?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const { content } = body

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    )
  }

  if (content.length > 1000) {
    return NextResponse.json(
      { error: "Content must be 1000 characters or less" },
      { status: 400 }
    )
  }

  // Create comment and activity in transaction
  const comment = await prisma.$transaction(async (tx) => {
    // Create comment
    const newComment = await tx.comment.create({
      data: {
        content: content.trim(),
        userId,
        sessionId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Create activity
    await tx.activity.create({
      data: {
        type: "comment_session",
        userId,
        sessionId,
      },
    })

    return newComment
  })

  return NextResponse.json(comment, { status: 201 })
}

