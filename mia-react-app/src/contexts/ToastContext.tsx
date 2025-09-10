import { createContext, useContext } from 'react'
import { useToast } from '@/hooks/useToast'
import type { ToastMessage } from '@/hooks/useToast'
import { Toast, ToastAction, ToastDescription, ToastTitle } from '@/components/ui/toast'

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
      {/* Toast Display */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastFunctions.toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.variant}>
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            <ToastDescription>{toast.description}</ToastDescription>
            <ToastAction
              onClick={() => toastFunctions.dismiss(toast.id)}
              aria-label="Dismiss"
            >
              ×
            </ToastAction>
          </Toast>
        ))}
      </div>
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