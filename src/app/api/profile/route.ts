import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
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
          programs: true,
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

  return NextResponse.json({
    ...user,
    stats: {
      followers: user._count.followers,
      following: user._count.following,
      programs: user._count.programs,
      sessions: user._count.sessions,
    },
    _count: undefined,
  })
}

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  let body: {
    name?: string
    bio?: string
    location?: string
    isPublic?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const { name, bio, location, isPublic } = body

  // Validate bio length
  if (bio !== undefined && bio !== null && bio.length > 500) {
    return NextResponse.json(
      { error: "Bio must be 500 characters or less" },
      { status: 400 }
    )
  }

  const updateData: {
    name?: string | null
    bio?: string | null
    location?: string | null
    isPublic?: boolean
  } = {}

  if (name !== undefined) {
    updateData.name = name?.trim() || null
  }
  if (bio !== undefined) {
    updateData.bio = bio?.trim() || null
  }
  if (location !== undefined) {
    updateData.location = location?.trim() || null
  }
  if (isPublic !== undefined) {
    updateData.isPublic = isPublic
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      email: true,
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
          programs: true,
          sessions: true,
        }
      }
    }
  })

  return NextResponse.json({
    ...updatedUser,
    stats: {
      followers: updatedUser._count.followers,
      following: updatedUser._count.following,
      programs: updatedUser._count.programs,
      sessions: updatedUser._count.sessions,
    },
    _count: undefined,
  })
}
