import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { DiscoverTabs } from "./DiscoverTabs"

type PageProps = {
  searchParams: Promise<{ tab?: string }>
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const session = await auth()
  const params = await searchParams
  const initialTab = (params.tab as "programs" | "sessions" | "users") || "programs"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Decouvrir</h1>
          <p className="mt-1 text-sm text-gray-600">
            Explorez les programmes, seances et utilisateurs publics
          </p>
        </div>

        {/* Tabs with Suspense for useSearchParams */}
        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">Chargement...</p>
            </div>
          }
        >
          <DiscoverTabs
            initialTab={initialTab}
            isAuthenticated={!!session?.user?.id}
          />
        </Suspense>
      </div>
    </div>
  )
}
