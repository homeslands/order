import { useEffect, useState } from 'react';
import { SquareMenu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { UpdateStaticPageDialog } from '@/components/app/dialog';
import { useStaticPage } from '@/hooks';
import { TextEditor } from './components';

export default function StaticPageDetailPage() {
  const { t } = useTranslation(['staticPage']);
  const { key } = useParams();
  const { data: staticPage, refetch } = useStaticPage(key as string);
  const [editorData, setEditorData] = useState('');

  // Fetch data whenever the selected page changes
  useEffect(() => {
    if (staticPage?.result?.content) {
      setEditorData(staticPage.result.content); // Update editor data with fetched content
    } else {
      setEditorData(''); // Clear editor data if no content is available
    }
  }, [staticPage]);

  const getUpdatePageData = () => {
    if (!staticPage?.result) return null;

    return {
      slug: staticPage.result.slug,
      key: staticPage.result.key,
      title: staticPage.result.title,
      content: editorData, // Use current editor content instead of staticPage content
    };
  };

  const onCompleted = () => {
    refetch();
  };

  return (
    <div className="editor-container">
      <span className="flex items-center justify-start w-full gap-1 text-lg">
        <SquareMenu />
        {t('staticPage.staticPageTitle')}
      </span>
      <div className="flex justify-end gap-2 pt-1">
        {/* <StaticPageSelect
          defaultValue="ABOUT-US"
          onChange={(slug) => {
            setSelectedPage(slug); // Update selected page
            refetch(); // Fetch new data for the selected page
          }}
        /> */}
        {/* {!staticPage?.result && <CreateStaticPageDialog content={editorData} />} */}
        <UpdateStaticPageDialog staticPageData={getUpdatePageData()} onCompleted={onCompleted} />
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
          <div className="p-4">
            <div dangerouslySetInnerHTML={{ __html: editorData }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
