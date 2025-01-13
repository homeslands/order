import { cn } from '@/lib/utils'
import { StarFilledIcon } from '@radix-ui/react-icons'

interface RatingProps {
  rating: number | null
}

export default function Rating({ rating }: RatingProps) {
  const maxStars = 5

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => (
        <span
          key={index}
          className={cn(
            'text-primary',
            index < (rating || 0) ? 'fill-current' : 'text-gray-300',
          )}
        >
          <StarFilledIcon className="h-6 w-6 text-primary" />
        </span>
      ))}
    </div>
  )
}
