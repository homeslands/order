// YouTube API Types
export interface YouTubePlayer {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  seekTo(seconds: number, allowSeekAhead?: boolean): void
  destroy(): void
  getPlayerState(): number
  getCurrentTime(): number
  getDuration(): number
}

export interface YouTubePlayerEvent {
  target: YouTubePlayer
  data: number
}

export interface YouTubePlayerVars {
  autoplay?: 0 | 1
  controls?: 0 | 1
  showinfo?: 0 | 1
  rel?: 0 | 1
  fs?: 0 | 1
  playsinline?: 0 | 1
  start?: number
  end?: number
  loop?: 0 | 1
  playlist?: string
  modestbranding?: 0 | 1
  iv_load_policy?: 1 | 3
  cc_load_policy?: 0 | 1
  disablekb?: 0 | 1
  enablejsapi?: 0 | 1
}

export interface YouTubePlayerOptions {
  height?: string | number
  width?: string | number
  videoId?: string
  playerVars?: YouTubePlayerVars
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void
    onStateChange?: (event: YouTubePlayerEvent) => void
    onPlaybackQualityChange?: (event: YouTubePlayerEvent) => void
    onPlaybackRateChange?: (event: YouTubePlayerEvent) => void
    onError?: (event: YouTubePlayerEvent) => void
    onApiChange?: (event: YouTubePlayerEvent) => void
  }
}

export interface YouTubeAPI {
  Player: new (
    elementId: string,
    options: YouTubePlayerOptions,
  ) => YouTubePlayer
  PlayerState: {
    UNSTARTED: -1
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }
}

declare global {
  interface Window {
    YT: YouTubeAPI
    onYouTubeIframeAPIReady: () => void
  }
}
