import { useState, useEffect } from 'react'
import { Gift } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { useIsMobile } from '@/hooks'

interface DraggableGiftCardButtonProps {
  quantity?: number
  onClick?: () => void
}

export default function DraggableGiftCardButton({
  quantity,
  onClick,
}: DraggableGiftCardButtonProps) {
  const isMobile = useIsMobile()

  // Trạng thái và vị trí cho kéo thả
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updatePosition = () => {
      const newX = window.innerWidth - 70 
      const newY = window.innerHeight / 2 - 25

      const maxX = window.innerWidth - 50
      const maxY = window.innerHeight - 50

      setPosition({
        x: Math.min(Math.max(newX, 0), maxX),
        y: Math.min(Math.max(newY, 0), maxY),
      })
    }

    updatePosition()

    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
    }
  }, [])

  useEffect(() => {
    const adjustPositionForViewport = () => {
      const maxX = window.innerWidth - 50
      const maxY = window.innerHeight - 50

      setPosition((prev) => ({
        x: Math.min(Math.max(prev.x, 0), maxX),
        y: Math.min(Math.max(prev.y, 0), maxY),
      }))
    }

    adjustPositionForViewport()
  }, [isMobile])

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    if (isMobile) document.body.style.overflow = 'hidden'
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX - position.x, y: clientY - position.y })
  }

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      // Giới hạn vị trí trong phạm vi màn hình
      const maxX = window.innerWidth - 50 // 50 là width của button
      const maxY = window.innerHeight - 50
      const newX = Math.min(Math.max(clientX - dragStart.x, 0), maxX)
      const newY = Math.min(Math.max(clientY - dragStart.y, 0), maxY)

      setPosition({ x: newX, y: newY })
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    document.body.style.overflow = 'auto'
  }
  const handleClick = (_e: React.MouseEvent) => {
    // Chỉ gọi onClick nếu không phải đang kéo
    if (!isDragging && onClick) {
      onClick()
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed z-50 cursor-pointer select-none bg-primary text-white shadow-lg hover:bg-primary/90"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleDragStart}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDrag}
      onTouchEnd={handleDragEnd}
      onClick={handleClick}
    >
      <Gift className="h-6 w-6" />
      {quantity && quantity > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full p-0 text-xs dark:bg-red-600"
        />
      )}
    </Button>
  )
}
