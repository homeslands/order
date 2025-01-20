import { useStaticPage } from "@/hooks";

export default function PolicyPage() {
    const { data: staticPage, isLoading } = useStaticPage("POLICY");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-lg font-medium text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!staticPage || !staticPage.result) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-lg font-medium text-gray-500">
                    No content available.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="py-10 bg-gray-800">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold text-white">
                        {staticPage.result.title}
                    </h1>
                </div>
            </header>
            <main className="container px-4 py-8 mx-auto">
                <article
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: staticPage.result.content }}
                />
            </main>
        </div>
    );
}
