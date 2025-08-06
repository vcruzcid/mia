import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg' | 'xl'
  className?: string
  text?: string
  fullScreen?: boolean
  overlay?: boolean
}

export function LoadingSpinner({ 
  size = 'default', 
  className, 
  text = 'Cargando...', 
  fullScreen = false,
  overlay = false
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      fullScreen && "min-h-screen",
      className
    )}>
      <Spinner size={size} className="text-red-500" srText={text} />
      {text && (
        <p className="text-sm text-gray-300 animate-pulse" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}