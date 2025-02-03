import { useStaticPage } from '@/hooks'

export default function PolicyPage() {
  const { data: staticPage, isLoading } = useStaticPage('POLICY')

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg font-medium text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!staticPage || !staticPage.result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg font-medium text-gray-500">
          No content available.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-800 py-10">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold text-white">
            {staticPage.result.title}
          </h1>
        </div>
      </header>
      <main className="ql-snow container mx-auto px-4 py-8">
        <article
          className="prose prose-lg ql-editor max-w-none text-xs"
          dangerouslySetInnerHTML={{ __html: staticPage.result.content }}
        />
      </main>
    </div>
  )
}
