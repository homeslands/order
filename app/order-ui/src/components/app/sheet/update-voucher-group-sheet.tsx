import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { ConfirmUpdateVoucherGroupDialog } from '@/components/app/dialog'
import { IUpdateVoucherGroupRequest, IVoucherGroup } from '@/types'
import { TUpdateVoucherGroupSchema, updateVoucherGroupSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'

interface IUpdateVoucherGroupSheetProps {
  voucherGroup: IVoucherGroup
}

export default function UpdateVoucherGroupSheet({
  voucherGroup,
}: IUpdateVoucherGroupSheetProps) {
  const { t } = useTranslation(['voucher'])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<IUpdateVoucherGroupRequest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<TUpdateVoucherGroupSchema>({
    resolver: zodResolver(updateVoucherGroupSchema),
    defaultValues: {
      slug: voucherGroup.slug,
      title: voucherGroup.title,
      description: voucherGroup.description,
    },
  })

  const handleSubmit = (data: IUpdateVoucherGroupRequest) => {
    setFormData(data)
    setIsOpen(true)
  }

  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
    })
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetOpen(true)
  }

  const formFields = {
    title: (
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.voucherGroupTitle')}
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('voucher.enterVoucherGroupTitle')} />
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
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.description')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('voucher.enterVoucherGroupDescription')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="gap-1 px-2" onClick={handleClick}>
          <PenLine className="icon" />
          {t('voucher.update')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.update')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 bg-muted-foreground/10 p-4">
            {/* Voucher name and description */}
            <div className="flex flex-col flex-1">
              <Form {...form}>
                <form
                  id="voucher-form"
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  {/* Nhóm: Tên và Mô tả */}
                  <div className="p-4 bg-white rounded-md border">
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.title}
                      {formFields.description}
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button type="submit" form="voucher-form">
              {t('voucher.update')}
            </Button>
            {isOpen && (
              <ConfirmUpdateVoucherGroupDialog
                voucherGroup={formData}
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
