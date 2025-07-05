import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PlusCircle } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  Input,
  SheetFooter,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui'
import { CreatePrinterDialog } from '@/components/app/dialog'
import { ICreatePrinterForChefAreaRequest } from '@/types'
import { createPrinterForChefAreaSchema, TCreatePrinterForChefAreaSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { PrinterDataType } from '@/constants'
import { PrinterDataTypeSelect } from '../select'

export default function CreatePrinterSheet() {
  const { t } = useTranslation(['chefArea'])
  const { slug } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<ICreatePrinterForChefAreaRequest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<TCreatePrinterForChefAreaSchema>({
    resolver: zodResolver(createPrinterForChefAreaSchema),
    defaultValues: {
      name: '',
      ip: '',
      port: '',
      dataType: PrinterDataType.TSPL_ZPL,
      description: '',
      slug: slug || '',
    },
  })

  const handleSubmit = (data: ICreatePrinterForChefAreaRequest) => {
    // add chefArea slug if not provided
    if (!data.slug) {
      data.slug = slug || ''
    }
    setFormData(data)
    setIsOpen(true)
  }

  const resetForm = () => {
    form.reset({
      name: '',
      ip: '',
      port: '',
      dataType: PrinterDataType.TSPL_ZPL,
      description: '',
      slug: slug || '',
    })
  }

  const formFields = {
    name: (
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('printer.name')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('printer.enterPrinterName')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    description: (
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              {t('printer.description')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('printer.enterPrinterDescription')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    dataType: (
      <FormField
        control={form.control}
        name="dataType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('printer.dataType')}
            </FormLabel>
            <FormControl>
              <PrinterDataTypeSelect
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    ip: (
      <FormField
        control={form.control}
        name="ip"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('printer.ip')}
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                value={field.value ?? ''}
                onChange={(e) => {
                  // always store as string
                  field.onChange(e.target.value.toString());
                }}
                placeholder={t('printer.enterPrinterIp')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    port: (
      <FormField
        control={form.control}
        name="port"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('printer.port')}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                value={field.value ?? ''}
                onChange={(e) => {
                  // always store as string
                  field.onChange(e.target.value.toString());
                }}
                placeholder={t('printer.enterPrinterPort')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle size={16} />
          {t('printer.create')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('printer.create')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 bg-muted-foreground/10 p-4">
            {/* Voucher name and description */}
            <div className="flex flex-col flex-1">
              <Form {...form}>
                <form
                  id="printer-form"
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  {/* Nhóm: Tên và Mô tả */}
                  <div className={`p-4 bg-white rounded-md border dark:bg-transparent`}>
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.name}
                      {formFields.description}
                    </div>
                  </div>

                  {/* Nhóm: Ngày bắt đầu và Kết thúc */}
                  <div className={`grid grid-cols-2 gap-2 p-4 bg-white rounded-md border dark:bg-transparent`}>
                    {formFields.ip}
                    {formFields.port}
                  </div>

                  {/* Nhóm: Kiểu khuyến mãi và giá trị khuyến mãi */}
                  <div className={`grid grid-cols-1 gap-2 p-4 bg-white rounded-md border dark:bg-transparent`}>
                    {formFields.dataType}
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button type="submit" form="printer-form">
              {t('printer.create')}
            </Button>
            {isOpen && (
              <CreatePrinterDialog
                printer={formData}
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                onCloseSheet={() => setSheetOpen(false)}
                onSuccess={resetForm} // Thêm callback onSuccess
              />
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
