import { Skeleton } from '@/components/ui'

export function TransactionCardSkeleton() {
  return (
    <div className="mb-3 rounded-md border-l-4 border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/10">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="mb-2 h-4 w-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>
  )
}
