import { useState, useCallback } from 'react'

export interface ToastMessage {
  id: string
  title?: string
  description: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      id,
      title,
      description,
      variant,
      duration
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)

    return id
  }, [])

  const dismiss = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    toast,
    dismiss,
    dismissAll
  }
}