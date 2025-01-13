import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'

export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={scrollToTop}
            className={cn(
              'fixed bottom-20 right-4 z-50 rounded-full bg-primary/80 p-2 text-white shadow-lg transition-all hover:bg-primary',
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-10 opacity-0',
            )}
            aria-label="Back to top"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Lên đầu trang</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
