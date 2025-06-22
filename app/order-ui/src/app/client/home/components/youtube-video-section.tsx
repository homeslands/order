import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useIsMobile } from '@/hooks'
import { YouTubePlayer } from '@/types/youtube'

interface YouTubeVideoSectionProps {
    videoId: string;
    title?: string;
    description?: string;
}

export const YouTubeVideoSection: React.FC<YouTubeVideoSectionProps> = ({
    videoId,
    title,
    description
}) => {
    const { t } = useTranslation('home')
    const isMobile = useIsMobile()
    const playerRef = useRef<YouTubePlayer | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isPlayerReady, setIsPlayerReady] = useState(false)

    // Animation variants
    const fadeInVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: 'easeOut' },
        },
    }

    // Initialize YouTube player
    useEffect(() => {
        const initializePlayer = () => {
            if (window.YT && window.YT.Player) {
                playerRef.current = new window.YT.Player('youtube-player', {
                    height: isMobile ? '250' : '400',
                    width: '100%',
                    videoId: videoId,
                    playerVars: {
                        autoplay: 0,
                        controls: 1,
                        showinfo: 0,
                        rel: 0,
                        fs: 1,
                        playsinline: 1,
                        loop: 1,
                        playlist: videoId,
                        modestbranding: 1,
                        iv_load_policy: 3,
                        cc_load_policy: 0,
                        enablejsapi: 1,
                    },
                    events: {
                        onReady: () => {
                            setIsPlayerReady(true)
                        },
                        onStateChange: () => {
                            // Handle player state changes if needed
                        },
                    },
                })
            }
        }

        if (!window.YT) {
            const tag = document.createElement('script')
            tag.src = 'https://www.youtube.com/iframe_api'
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

            window.onYouTubeIframeAPIReady = () => {
                initializePlayer()
            }
        } else {
            initializePlayer()
        }

        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy()
                } catch {
                    // Silently handle player destruction error
                }
            }
        }
    }, [isMobile, videoId])



    // Intersection Observer for auto-play when visible
    useEffect(() => {
        const currentContainer = containerRef.current
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isVisible) {
                        setIsVisible(true)
                        // Auto-play when visible with delay
                        setTimeout(() => {
                            if (isPlayerReady && playerRef.current) {
                                try {
                                    playerRef.current.playVideo()
                                } catch {
                                    // Silently handle play error
                                }
                            }
                        }, 500)
                    } else if (!entry.isIntersecting && isVisible) {
                        setIsVisible(false)
                        // Pause when not visible
                        if (isPlayerReady && playerRef.current) {
                            try {
                                playerRef.current.pauseVideo()
                            } catch {
                                // Silently handle pause error
                            }
                        }
                    }
                })
            },
            {
                threshold: 0.5, // Trigger when 50% of the element is visible
            }
        )

        if (currentContainer) {
            observer.observe(currentContainer)
        }

        return () => {
            if (currentContainer) {
                observer.unobserve(currentContainer)
            }
        }
    }, [isVisible, isPlayerReady])

    return (
        <div className="container">
            <motion.div
                ref={containerRef}
                className="grid grid-cols-1 gap-4 items-start py-4 w-full sm:grid-cols-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInVariants}
            >
                {/* Video Container - Left side (3 columns) */}
                <div className="flex justify-center sm:col-span-3">
                    <div className="w-full">
                        <div className="relative w-full" style={{ paddingBottom: isMobile ? '56.25%' : '56.25%' }}>
                            <div
                                id="youtube-player"
                                className="overflow-hidden absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                                style={{
                                    pointerEvents: 'auto'
                                }}
                            />
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                    #youtube-player .ytp-endscreen-content,
                                    #youtube-player .ytp-pause-overlay,
                                    #youtube-player .ytp-related-on-error-overlay,
                                    #youtube-player .ytp-suggested-action,
                                    #youtube-player .ytp-cards-teaser,
                                    #youtube-player .ytp-ce-element,
                                    #youtube-player .ytp-show-cards-title {
                                        display: none !important;
                                    }
                                `
                            }} />
                        </div>
                    </div>
                </div>

                {/* Text Content - Right side (2 columns) */}
                <div className="flex justify-center items-center h-full sm:col-span-2">
                    <div className="flex flex-col gap-4 items-start sm:w-2/3">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-extrabold text-primary">
                                {title || t('home.videoSection.title', 'Khám phá câu chuyện TREND Coffee')}
                            </h2>
                            {description && (
                                <span className="text-muted-foreground">
                                    {description}
                                </span>
                            )}
                        </div>

                        {/* Additional info */}
                        {/* <div className="text-sm text-muted-foreground">
                            <p>{t('home.videoSection.autoplayNote', 'Video sẽ tự động phát khi bạn cuộn đến đây')}</p>
                        </div> */}
                    </div>
                </div>
            </motion.div>
        </div>
    )
} 