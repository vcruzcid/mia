import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { Spinner } from '@/components/ui/spinner'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean, message?: string) => void
  loadingMessage: string
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Cargando...')

  const setLoading = (loading: boolean, message = 'Cargando...') => {
    setIsLoading(loading)
    setLoadingMessage(message)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingMessage }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <Spinner className="h-6 w-6" />
            <span className="text-gray-900">{loadingMessage}</span>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

// Hook for async operations with loading state
export function useAsyncLoading() {
  const { setLoading } = useLoading()

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      setLoading(true, message)
      const result = await asyncFn()
      return result
    } finally {
      setLoading(false)
    }
  }

  return { withLoading }
}