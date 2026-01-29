import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

type RouteContext = {
  params: Promise<{ id: string }>
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

  const { id: commentId } = await context.params

  // Find comment with related program/session
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      program: {
        select: {
          id: true,
          authorId: true,
        },
      },
      session: {
        select: {
          id: true,
          authorId: true,
        },
      },
    },
  })

  if (!comment) {
    return NextResponse.json(
      { error: "Comment not found" },
      { status: 404 }
    )
  }

  // Check if user can delete (comment owner or program/session owner)
  const isCommentOwner = comment.userId === session.user.id
  const isContentOwner =
    (comment.program && comment.program.authorId === session.user.id) ||
    (comment.session && comment.session.authorId === session.user.id)

  if (!isCommentOwner && !isContentOwner) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  // Delete comment
  await prisma.comment.delete({
    where: { id: commentId },
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(
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

  const { id: commentId } = await context.params

  // Find comment
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  })

  if (!comment) {
    return NextResponse.json(
      { error: "Comment not found" },
      { status: 404 }
    )
  }

  // Check if user is comment owner (only owner can edit)
  if (comment.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
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

  // Update comment
  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: content.trim(),
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

  return NextResponse.json(updatedComment)
}


