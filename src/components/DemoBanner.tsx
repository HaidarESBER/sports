"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export function DemoBanner() {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <p className="text-sm font-medium">
              <span className="font-semibold">Mode démo:</span> Explorez la plateforme sans créer de compte
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/register">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Créer un compte
              </Button>
            </Link>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

