"use client"

import { useState, useRef, useEffect } from "react"

export interface ScheduledSession {
  sessionId: string
  sessionName: string
  weekNumber: number
  dayOfWeek: number
  order: number
}

export interface AvailableSession {
  id: string
  name: string
  sport: string
}

interface SessionSchedulerProps {
  durationWeeks: number
  scheduledSessions: ScheduledSession[]
  onScheduleChange: (sessions: ScheduledSession[]) => void
  availableSessions: AvailableSession[]
  programSport?: string
}

const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export function SessionScheduler({
  durationWeeks,
  scheduledSessions,
  onScheduleChange,
  availableSessions,
  programSport,
}: SessionSchedulerProps) {
  const [openDropdown, setOpenDropdown] = useState<{
    week: number
    day: number
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter sessions by program sport if set
  const filteredSessions = programSport
    ? availableSessions.filter((s) => s.sport === programSport)
    : availableSessions

  // Further filter by search term
  const searchedSessions = filteredSessions.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function getSessionsForCell(week: number, day: number) {
    return scheduledSessions
      .filter((s) => s.weekNumber === week && s.dayOfWeek === day)
      .sort((a, b) => a.order - b.order)
  }

  function handleAddSession(
    sessionId: string,
    sessionName: string,
    week: number,
    day: number
  ) {
    const existingInCell = getSessionsForCell(week, day)
    const newOrder =
      existingInCell.length > 0
        ? Math.max(...existingInCell.map((s) => s.order)) + 1
        : 1

    const newSession: ScheduledSession = {
      sessionId,
      sessionName,
      weekNumber: week,
      dayOfWeek: day,
      order: newOrder,
    }

    onScheduleChange([...scheduledSessions, newSession])
    setOpenDropdown(null)
    setSearchTerm("")
  }

  function handleRemoveSession(
    sessionId: string,
    week: number,
    day: number,
    order: number
  ) {
    onScheduleChange(
      scheduledSessions.filter(
        (s) =>
          !(
            s.sessionId === sessionId &&
            s.weekNumber === week &&
            s.dayOfWeek === day &&
            s.order === order
          )
      )
    )
  }

  function handleCellClick(week: number, day: number) {
    if (openDropdown?.week === week && openDropdown?.day === day) {
      setOpenDropdown(null)
      setSearchTerm("")
    } else {
      setOpenDropdown({ week, day })
      setSearchTerm("")
    }
  }

  if (durationWeeks < 1) {
    return (
      <div className="text-center py-8 text-gray-500">
        Definissez la duree du programme pour planifier les seances.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header row */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="text-sm font-medium text-gray-500 py-2 px-2"></div>
          {dayLabels.map((day, index) => (
            <div
              key={index}
              className="text-sm font-medium text-gray-700 py-2 px-2 text-center bg-gray-100 rounded"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {Array.from({ length: durationWeeks }, (_, weekIndex) => {
          const week = weekIndex + 1
          return (
            <div key={week} className="grid grid-cols-8 gap-1 mb-1">
              {/* Week label */}
              <div className="text-sm font-medium text-gray-500 py-2 px-2 flex items-center">
                Sem. {week}
              </div>

              {/* Day cells */}
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const day = dayIndex + 1
                const cellSessions = getSessionsForCell(week, day)
                const isDropdownOpen =
                  openDropdown?.week === week && openDropdown?.day === day

                return (
                  <div
                    key={day}
                    className="relative min-h-[60px] border border-gray-200 rounded p-1 bg-white hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCellClick(week, day)}
                  >
                    {/* Scheduled sessions */}
                    <div className="space-y-1">
                      {cellSessions.map((session) => (
                        <div
                          key={`${session.sessionId}-${session.order}`}
                          className="flex items-center justify-between bg-blue-100 text-blue-800 text-xs rounded px-1.5 py-1 group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="truncate flex-1 mr-1">
                            {session.sessionName}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveSession(
                                session.sessionId,
                                week,
                                day,
                                session.order
                              )
                            }}
                            className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              className="w-3 h-3"
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
                      ))}
                    </div>

                    {/* Add button when empty */}
                    {cellSessions.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Dropdown */}
                    {isDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-10 top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-2 border-b border-gray-100">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {searchedSessions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              Aucune seance disponible
                            </div>
                          ) : (
                            searchedSessions.map((session) => (
                              <button
                                key={session.id}
                                type="button"
                                onClick={() =>
                                  handleAddSession(
                                    session.id,
                                    session.name,
                                    week,
                                    day
                                  )
                                }
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                              >
                                {session.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Legend / Help */}
      <div className="mt-4 text-xs text-gray-500">
        <p>Cliquez sur une cellule pour ajouter une seance. Plusieurs seances par jour sont supportees.</p>
      </div>
    </div>
  )
}
