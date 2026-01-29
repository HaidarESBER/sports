import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ProgressDashboard } from "./ProgressDashboard"

export default async function ProgressPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Suivi de progression</h1>
          <p className="mt-1 text-sm text-gray-400">
            Visualisez vos statistiques et votre progression au fil du temps
          </p>
        </div>

        {/* Dashboard */}
        <ProgressDashboard />
      </div>
    </div>
  )
}


