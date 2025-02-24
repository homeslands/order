import { useEffect, useState } from 'react'
import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { ConfirmUpdateBannerDialog } from '@/components/app/dialog'
import { useSpecificBanner } from '@/hooks'
import { TextEditor } from '@/components/app/text-editor'

export default function BannerDetailPage() {
    const { t } = useTranslation(['banner'])
    const { slug } = useParams()
    const { data: bannerDetail, refetch } = useSpecificBanner(slug as string)
    const [editorData, setEditorData] = useState('')

    // Fetch data whenever the selected page changes
    useEffect(() => {
        if (bannerDetail?.result?.content) {
            setEditorData(bannerDetail.result.content) // Update editor data with fetched content
        } else {
            setEditorData('') // Clear editor data if no content is available
        }
    }, [bannerDetail])

    const getUpdatePageData = () => {
        if (!bannerDetail?.result) return null

        return {
            slug: bannerDetail.result.slug,
            title: bannerDetail.result.title,
            content: editorData, // Use current editor content instead of staticPage content
            isActive: bannerDetail.result.isActive
        }
    }

    const onCompleted = () => {
        refetch()
    }

    return (
        <div className="editor-container">
            <span className="flex items-center justify-start w-full gap-1 text-lg">
                <SquareMenu />
                {t('banner.bannerDetailTitle')}
            </span>
            <div className="flex justify-end gap-2 pt-1">
                <ConfirmUpdateBannerDialog
                    banner={getUpdatePageData()}
                    onCompleted={onCompleted}
                />
            </div>
            <Tabs defaultValue="text" className="flex flex-col w-full gap-2">
                <TabsList className="sticky z-10 grid grid-cols-7 gap-2">
                    <TabsTrigger value="text">Chỉnh sửa</TabsTrigger>
                    <TabsTrigger value="preview">Xem trước</TabsTrigger>
                </TabsList>
                <TabsContent value="text">
                    <div className="flex flex-col gap-4">
                        <TextEditor
                            value={editorData}
                            onChange={setEditorData}
                            placeholder="Nhập nội dung..."
                        />
                    </div>
                </TabsContent>
                <TabsContent value="preview">
                    <div className="ql-snow">
                        <div
                            className="text-xs ql-editor"
                            dangerouslySetInnerHTML={{ __html: editorData }}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
