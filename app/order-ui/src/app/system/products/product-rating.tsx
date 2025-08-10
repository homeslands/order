import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

interface RatingProps {
  rating: number | null
}

export default function Rating({ rating }: RatingProps) {
  const maxStars = 5

  return (
    <div className="flex items-center">
      {[...Array(maxStars)].map((_, index) => (
        <span
          key={index}
          className={cn('text-primary', index < (rating || 0) ? 'fill-current' : 'text-gray-300')}
        >
          {index < (rating || 0) ? (
            <Star className="w-6 h-6 text-primary" />
          ) : (
            <Star className="w-6 h-6" />
          )}
        </span>
      ))}
    </div>
  )
}
