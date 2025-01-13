import { TLoggerLevel } from '@/types'

interface ILogLevelBadgeProps {
  level: TLoggerLevel
}

const getBadgeColor = (level: TLoggerLevel) => {
  switch (level) {
    case 'error':
      return 'border-destructive border text-destructive'
    case 'warn':
      return 'border-yellow-500 border text-yellow-500 font-semibold'
    case 'info':
      return 'border-green-500 border text-green-500 font-semibold'
    case 'debug':
      return 'bg-gray-500/20 border-gray-500 border text-gray-500'
    default:
      return 'bg-gray-500/20 border-gray-500 border text-gray-500'
  }
}

const getBadgeText = (level: TLoggerLevel) => {
  switch (level) {
    case 'error':
      return 'Error'
    case 'warn':
      return 'Warn'
    case 'info':
      return 'Info'
    case 'debug':
      return 'Debug'
    default:
      return 'Debug'
  }
}

export default function LogLevelBadge({ level }: ILogLevelBadgeProps) {
  // Ensure the component returns valid JSX
  return (
    <span
      className={`inline-block min-w-[4.5rem] px-1.5 py-1 text-center text-xs ${getBadgeColor(
        level,
      )} rounded-full`}
    >
      {getBadgeText(level)}
    </span>
  )
}
