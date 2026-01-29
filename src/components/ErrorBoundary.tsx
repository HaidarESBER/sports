'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error (in production, send to error monitoring service)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when children change
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <svg
            className="h-12 w-12 text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Une erreur est survenue
          </h3>
          <p className="text-sm text-red-700 mb-4 text-center">
            {process.env.NODE_ENV === 'development' && this.state.error
              ? this.state.error.message
              : 'Quelque chose s\'est mal passé. Veuillez réessayer.'}
          </p>
          <Button onClick={this.handleReset} variant="outline" size="sm">
            Réessayer
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

