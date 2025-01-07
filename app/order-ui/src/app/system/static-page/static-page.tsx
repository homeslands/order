import { useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CustomUploadAdapterPlugin } from './components/CustomUploadAdapter'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

const LICENSE_KEY =
  'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzcxNTgzOTksImp0aSI6ImQ3ZTA3ZjZjLTY2NDYtNDdmYy1iNDQ3LWFlMzMwZTI2MWVkZiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImQ2NGZlN2VkIn0.AZAEbT9H0MNT6GRDgmkQZ9I5EZ0lfqHdJTNISamd-kF6-MlruQDNPD4VMO2yRiTwDOkjRLq7g2Oqs_kvogjZ9A'

export default function StaticPage() {
  const [editorData, setEditorData] = useState('<p>Hello from CKEditor 5!</p>')

  const editorConfig = {
    licenseKey: LICENSE_KEY,
    language: 'vi',
    extraPlugins: [CustomUploadAdapterPlugin],
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        '|',
        'fontSize',
        'fontColor',
        '|',
        'alignment', // Single alignment button that shows all options
        '|',
        'numberedList',
        'bulletedList',
        '|',
        'indent',
        'outdent',
        '|',
        'link',
        'insertImage',
        'insertTable',
        '|',
        'undo',
        'redo'
      ],
      shouldNotGroupWhenFull: true
    },
    image: {
      styles: {
        options: [
          'inline',
          'alignLeft',
          'alignRight',
          'alignCenter',
          'alignBlockLeft',
          'alignBlockRight',
          'block',
          'side',
        ],
      },
      resizeOptions: [
        {
          name: 'resizeImage:original',
          value: null,
          label: 'Original',
        },
        {
          name: 'resizeImage:50',
          value: '50',
          label: '50%',
        },
        {
          name: 'resizeImage:75',
          value: '75',
          label: '75%',
        },
      ],
      resizeUnit: '%' as const,
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'resizeImage:50',
        'resizeImage:75',
        'resizeImage:original',
      ],
    },
    alignment: {
      options: ['left', 'right', 'center', 'justify'] as [
        'left',
        'right',
        'center',
        'justify',
      ],
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
  }

  return (
    <div className="editor-container">
      <Tabs defaultValue="text" className="flex flex-col w-full gap-2">
        <TabsList className="sticky z-10 grid grid-cols-7 gap-2">
          <TabsTrigger value="text">Chỉnh sửa</TabsTrigger>
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
        </TabsList>
        <TabsContent value="text">
          <CKEditor
            editor={ClassicEditor}
            data={editorData}
            config={editorConfig}
            onChange={(_event, editor) => { // Thêm dấu gạch dưới để chỉ ra tham số không dùng
              setEditorData(editor.getData())
            }}
          />
        </TabsContent>
        <TabsContent value="preview">
          <div className="p-4 border rounded border-muted-foreground/30">
            <div dangerouslySetInnerHTML={{ __html: editorData }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
