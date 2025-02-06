import { CreateProductDialog, ExportAllProductsTemplateDialog, ExportProductImportTemplateDialog, ImportProductByTemplateDialog } from '@/components/app/dialog'

export default function ProductActionOptions() {
  return (
    <>
      <CreateProductDialog />
      <ImportProductByTemplateDialog />
      <ExportAllProductsTemplateDialog />
      <ExportProductImportTemplateDialog />
    </>
  )
}
