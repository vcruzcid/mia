import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="mb-6">
        <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 17c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-4">
        ¡Oops! Algo salió mal
      </h1>
      
      <p className="text-gray-300 mb-6">
        Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
      </p>
      
      <div className="space-y-4">
        <Button 
          onClick={resetError}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          Intentar de nuevo
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          Ir al inicio
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 text-left">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
            Detalles del error (desarrollo)
          </summary>
          <pre className="mt-2 text-xs bg-gray-800 p-4 rounded overflow-auto text-red-300">
            {error.toString()}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
)

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would typically send to an error monitoring service
      // like Sentry, LogRocket, or Bugsnag
      console.error('Production error:', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }

    this.setState({
      error,
      errorInfo
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: string) => {
    console.error('Manual error report:', error, errorInfo)
    throw error
  }
}