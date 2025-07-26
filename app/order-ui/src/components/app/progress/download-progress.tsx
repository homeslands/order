import { useTranslation } from 'react-i18next'
import { FileIcon } from '@radix-ui/react-icons'

import { Progress } from '@/components/ui'

interface IDownloadProgressProps {
  progress: number
  fileName: string
}

export default function DownloadProgress({ progress, fileName }: IDownloadProgressProps) {
  const { t } = useTranslation('progress')
  return (
    <div className="fixed bg-white rounded-lg shadow-lg right-4 bottom-4 w-72 z-[100]">
      <div className="flex flex-col justify-start px-3 py-4 rounded-t-md bg-muted">
        <h3 className="text-sm font-semibold">{t('progress.downloading')}</h3>
      </div>
      <div className="flex flex-row items-center justify-start px-3 py-2 ">
        <FileIcon className="w-3 h-3 mr-1 text-muted-foreground" />
        <span className="text-xs text-gray-500">{fileName}</span>
      </div>
      <div className="px-4 py-2">
        <Progress value={progress} className="w-full" />
        <p className="mt-1 text-xs text-right text-gray-500">{progress.toFixed(0)}%</p>
      </div>
    </div>
  )
}
