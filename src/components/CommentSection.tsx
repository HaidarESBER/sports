"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Comment = {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

type CommentSectionProps = {
  type: "program" | "session"
  targetId: string
  currentUserId?: string | null
}

export function CommentSection({
  type,
  targetId,
  currentUserId,
}: CommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")

  useEffect(() => {
    fetchComments(1)
  }, [type, targetId])

  async function fetchComments(pageNum: number) {
    try {
      const response = await fetch(
        `/api/${type}s/${targetId}/comments?page=${pageNum}&limit=20`
      )
      if (response.ok) {
        const data = await response.json()
        if (pageNum === 1) {
          setComments(data.comments)
        } else {
          setComments((prev) => [...prev, ...data.comments])
        }
        setHasMore(data.page < data.totalPages)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || !currentUserId) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/${type}s/${targetId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments((prev) => [comment, ...prev])
        setNewComment("")
      } else if (response.status === 401) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Supprimer ce commentaire?")) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  async function handleEdit(commentId: string) {
    if (!editingContent.trim()) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingContent.trim() }),
      })

      if (response.ok) {
        const updated = await response.json()
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? updated : c))
        )
        setEditingId(null)
        setEditingContent("")
      }
    } catch (error) {
      console.error("Error editing comment:", error)
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(date)
  }

  function getInitial(name: string | null): string {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Commentaires
        </h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Commentaires ({comments.length})
      </h3>

      {/* Comment form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            rows={3}
            maxLength={1000}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {newComment.length}/1000
            </span>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Publication..." : "Publier"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
          <p className="text-sm text-gray-600 mb-2">
            Connectez-vous pour commenter
          </p>
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Se connecter
          </Link>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun commentaire. Soyez le premier!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-gray-200 pb-4 last:border-0"
            >
              {editingId === comment.id ? (
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditingContent("")
                      }}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/users/${comment.user.id}`}
                      className="flex-shrink-0"
                    >
                      {comment.user.image ? (
                        <img
                          src={comment.user.image}
                          alt={comment.user.name || "User"}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                          {getInitial(comment.user.name)}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/users/${comment.user.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {comment.user.name || "Utilisateur"}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                  {currentUserId &&
                    (comment.user.id === currentUserId ||
                      (type === "program" &&
                        false) /* TODO: check if user owns program */) && (
                      <div className="mt-2 flex gap-2">
                        {comment.user.id === currentUserId && (
                          <button
                            onClick={() => {
                              setEditingId(comment.id)
                              setEditingContent(comment.content)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Modifier
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              const nextPage = page + 1
              setPage(nextPage)
              fetchComments(nextPage)
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Charger plus
          </button>
        </div>
      )}
    </div>
  )
}

