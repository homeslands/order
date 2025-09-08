import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-md animate-pulse bg-muted-foreground/20', className)} {...props} />
}

export { Skeleton }
