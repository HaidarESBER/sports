import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { FeedList } from "./FeedList"

export default async function FeedPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Mon Feed</h1>
          <p className="mt-1 text-sm text-gray-400">
            Activité des utilisateurs que vous suivez
          </p>
        </div>

        {/* Feed */}
        <FeedList />
      </div>
    </div>
  )
}


