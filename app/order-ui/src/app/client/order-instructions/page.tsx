import { useStaticPage } from '@/hooks'
import { useTranslation } from 'react-i18next'

export default function OrderInstructionsPage() {
  const { t: tCommon } = useTranslation('common')
  const { data: staticPage, isLoading } = useStaticPage('ORDER_INSTRUCTION')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-medium text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!staticPage || !staticPage.result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">
          {tCommon('common.noData')}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="py-6">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold">
            {staticPage.result.title}
          </h1>
        </div>
      </header>
      <main className="container px-4 py-8 mx-auto ql-snow">
        <article
          className="text-xs prose prose-lg max-w-none ql-editor"
          dangerouslySetInnerHTML={{ __html: staticPage.result.content }}
        />
      </main>
    </div>
  )
}
