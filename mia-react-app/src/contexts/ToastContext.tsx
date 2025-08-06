import { createContext, useContext } from 'react'
import { useToast } from '@/hooks/useToast'
import type { ToastMessage } from '@/hooks/useToast'
import { Toaster } from '@/components/Toaster'

interface ToastContextType {
  toast: (toast: Omit<ToastMessage, 'id'>) => string
  dismiss: (toastId: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastFunctions = useToast()

  return (
    <ToastContext.Provider value={toastFunctions}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}