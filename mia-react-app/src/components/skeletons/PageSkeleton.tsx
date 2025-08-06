import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="bg-gray-800 border-gray-700 rounded-lg p-6">
      <Skeleton className="h-8 w-1/3 mb-6" />
      
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-32 w-full" />
        </div>
        
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <Skeleton className="h-8 w-24" />
    </div>
  )
}