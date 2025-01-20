import { useEffect, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { CreateStaticPageDialog, UpdateStaticPageDialog } from '@/components/app/dialog';
import { StaticPageSelect } from '@/components/app/select';
import { useStaticPage } from '@/hooks';
import { TextEditor } from './components';

export default function StaticPage() {
  const [selectedPage, setSelectedPage] = useState<string>('ABOUT-US');
  const { data: staticPage, refetch } = useStaticPage(selectedPage);
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
    refetch(); // Refresh data
    console.log('Updated static page successfully');
  };

  return (
    <div className="editor-container">
      <div className="flex justify-end gap-2 pt-1">
        <StaticPageSelect
          defaultValue="ABOUT-US"
          onChange={(slug) => {
            setSelectedPage(slug); // Update selected page
            refetch(); // Fetch new data for the selected page
          }}
        />
        {!staticPage?.result && <CreateStaticPageDialog content={editorData} />}
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
