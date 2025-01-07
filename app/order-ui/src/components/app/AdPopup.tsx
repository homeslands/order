import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { PopupLogo } from '@/assets/images'

export function AdPopup() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Show popup after 2 seconds
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-[90%] max-w-md rounded-lg bg-transparent">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute z-10 p-2 text-white rounded-full right-2 top-2 bg-white/20 backdrop-blur-sm hover:bg-white/40"
                >
                    <X size={24} />
                </button>

                {/* PNG Image container */}
                <div className="relative flex flex-col justify-center w-full">
                    <img
                        src={PopupLogo}
                        alt="Promotion"
                        className="w-full h-auto"
                        style={{
                            filter: 'drop-shadow(0 0 100px rgba(0,0,0,0.1))'
                        }}
                    />
                    <div className="flex items-center justify-center">
                        <span className="px-6 py-3 text-lg font-medium text-white transition-all rounded-full bg-gradient-to-r from-primary to-primary/80 hover:scale-105">
                            Giảm giá 50% cho tất cả sản phẩm
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
