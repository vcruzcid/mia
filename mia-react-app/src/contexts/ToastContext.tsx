import { createContext, useContext } from 'react'
import { useToast } from '@/hooks/useToast'
import type { ToastMessage } from '@/hooks/useToast'

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
          <div
            key={toast.id}
            className={`max-w-sm rounded-lg shadow-lg p-4 ${
              toast.variant === 'destructive'
                ? 'bg-red-600 text-white'
                : toast.variant === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-white'
            }`}
          >
            {toast.title && (
              <div className="font-semibold mb-1">{toast.title}</div>
            )}
            <div className="text-sm">{toast.description}</div>
            <button
              onClick={() => toastFunctions.dismiss(toast.id)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
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