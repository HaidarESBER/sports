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
  const { searchParams } = new URL(request.url)

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

  // Parse pagination params
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  // Get total count
  const total = await prisma.comment.count({
    where: { programId },
  })

  // Get comments
  const comments = await prisma.comment.findMany({
    where: { programId },
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
  const canComment = program.isPublic || program.authorId === userId
  if (!canComment) {
    return NextResponse.json(
      { error: "Program not found" },
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
        programId,
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
        type: "comment_program",
        userId,
        programId,
      },
    })

    return newComment
  })

  return NextResponse.json(comment, { status: 201 })
}

