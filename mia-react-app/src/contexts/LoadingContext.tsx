import { createContext, useContext, useState, ReactNode } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

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
        <LoadingSpinner
          overlay
          size="lg"
          text={loadingMessage}
        />
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