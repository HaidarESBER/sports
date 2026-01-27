"use client"

import { useState, useEffect, useCallback } from "react"

export type FilterState = {
  sport: string
  difficulty: string
  minDuration: string
  maxDuration: string
}

type SearchFiltersProps = {
  onSearch: (query: string) => void
  onFilterChange: (filters: FilterState) => void
  showSportFilter?: boolean
  showDifficultyFilter?: boolean
  showDurationFilter?: boolean
}

const sportOptions = [
  { value: "", label: "Tous les sports" },
  { value: "running", label: "Course" },
  { value: "swimming", label: "Natation" },
  { value: "cycling", label: "Cyclisme" },
  { value: "strength", label: "Musculation" },
  { value: "other", label: "Autre" },
]

const difficultyOptions = [
  { value: "", label: "Toutes les difficultés" },
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
]

export function SearchFilters({
  onSearch,
  onFilterChange,
  showSportFilter = true,
  showDifficultyFilter = false,
  showDurationFilter = false,
}: SearchFiltersProps) {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    sport: "",
    difficulty: "",
    minDuration: "",
    maxDuration: "",
  })

  // Debounced search callback
  const debouncedSearch = useCallback(
    (query: string) => {
      onSearch(query)
    },
    [onSearch]
  )

  // Debounce search input
  useEffect(() => {
    const debounce = setTimeout(() => {
      debouncedSearch(search)
    }, 300)

    return () => clearTimeout(debounce)
  }, [search, debouncedSearch])

  function handleFilterChange(key: keyof FilterState, value: string) {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  function clearFilters() {
    setSearch("")
    const clearedFilters: FilterState = {
      sport: "",
      difficulty: "",
      minDuration: "",
      maxDuration: "",
    }
    setFilters(clearedFilters)
    onSearch("")
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters =
    search ||
    filters.sport ||
    filters.difficulty ||
    filters.minDuration ||
    filters.maxDuration

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        {showSportFilter && (
          <select
            value={filters.sport}
            onChange={(e) => handleFilterChange("sport", e.target.value)}
            className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {sportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {showDifficultyFilter && (
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {showDurationFilter && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.minDuration}
              onChange={(e) => handleFilterChange("minDuration", e.target.value)}
              placeholder="Min"
              min="0"
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500 text-sm">-</span>
            <input
              type="number"
              value={filters.maxDuration}
              onChange={(e) => handleFilterChange("maxDuration", e.target.value)}
              placeholder="Max"
              min="0"
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500 text-sm">min</span>
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              className="h-4 w-4 mr-1"
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
            Effacer
          </button>
        )}
      </div>
    </div>
  )
}
