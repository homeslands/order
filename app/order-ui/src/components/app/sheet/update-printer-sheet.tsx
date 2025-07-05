import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PenLine } from 'lucide-react'

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
import { UpdatePrinterDialog } from '@/components/app/dialog'
import { IPrinterForCHefArea, IUpdatePrinterForChefAreaRequest } from '@/types'
import { TUpdatePrinterForChefAreaSchema, updatePrinterForChefAreaSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { PrinterDataType } from '@/constants'
import { PrinterDataTypeSelect } from '../select'

interface IUpdatePrinterSheetProps {
  printer: IPrinterForCHefArea
}

export default function UpdatePrinterSheet({
  printer,
}: IUpdatePrinterSheetProps) {
  const { t } = useTranslation(['chefArea'])
  const { slug } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<IUpdatePrinterForChefAreaRequest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<TUpdatePrinterForChefAreaSchema>({
    resolver: zodResolver(updatePrinterForChefAreaSchema),
    defaultValues: {
      printerSlug: '',
      slug: slug || '',
      name: '',
      ip: '',
      port: '',
      dataType: printer.dataType,
      description: '',
    },
  })

  useEffect(() => {
    if (printer && slug) {
      form.reset({
        slug: slug,
        printerSlug: printer.slug,
        name: printer.name,
        ip: printer.ip,
        port: printer.port,
        dataType: printer.dataType,
        description: printer.description || '',
      })
    }
  }, [printer, form, slug])

  const handleSubmit = (data: IUpdatePrinterForChefAreaRequest) => {
    setFormData(data)
    setIsOpen(true)
  }

  const resetForm = () => {
    form.reset({
      printerSlug: printer?.slug,
      slug: slug || '',
      name: printer.name,
      ip: printer.ip,
      port: printer.port,
      dataType: PrinterDataType.TSPL_ZPL,
      description: printer.description || '',
    })
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetOpen(true)
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
              <Input {...field} placeholder={t('promotion.enterPrinterName')} />
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
                placeholder={t('printer.enterPrinterPort')}
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
        <Button variant="ghost" className="justify-start w-full gap-1 px-2" onClick={handleClick}>
          <PenLine className="icon" />
          {t('printer.update')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('printer.update')}
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
                  <div className="p-4 bg-white border rounded-md dark:bg-transparent">
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.name}
                      {formFields.description}
                    </div>
                  </div>

                  {/* Nhóm: Địa chỉ IP và Port */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white border rounded-md dark:bg-transparent">
                    {formFields.ip}
                    {formFields.port}
                  </div>

                  {/* Nhóm: Kiểu dữ liệu */}
                  <div className="grid grid-cols-1 gap-2 p-4 bg-white border rounded-md dark:bg-transparent">
                    {formFields.dataType}
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button type="submit" form="printer-form">
              {t('printer.update')}
            </Button>
            {isOpen && (
              <UpdatePrinterDialog
                printer={formData}
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                onCloseSheet={() => setSheetOpen(false)}
                onSuccess={resetForm}
              />
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
