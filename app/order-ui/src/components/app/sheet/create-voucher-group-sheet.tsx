import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { ConfirmCreateVoucherGroupDialog } from '@/components/app/dialog'
import { ICreateVoucherGroupRequest } from '@/types'
import { createVoucherGroupSchema, TCreateVoucherGroupSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'

export default function CreateVoucherGroupSheet() {
  const { t } = useTranslation(['voucher'])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<ICreateVoucherGroupRequest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<TCreateVoucherGroupSchema>({
    resolver: zodResolver(createVoucherGroupSchema),
    defaultValues: {
      title: '',
      description: '',
    }
  })

  const handleSubmit = (data: ICreateVoucherGroupRequest) => {
    setFormData(data)
    setIsOpen(true)
  }

  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
    })
  }

  const formFields = {
    title: (
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex gap-1 items-center'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.voucherGroupName')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('voucher.enterVoucherGroupName')} />
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
            <FormLabel className='flex gap-1 items-center'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.description')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('voucher.enterVoucherDescription')} />
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
          {t('voucher.createVoucherGroup')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.createVoucherGroup')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 p-4 bg-muted-foreground/10">
            {/* Voucher name and description */}
            <div className="flex flex-col flex-1">
              <Form {...form}>
                <form id="voucher-group-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Nhóm: Tên và Mô tả */}
                  <div className={`p-4 bg-white rounded-md border dark:bg-transparent`}>
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
            <Button type="submit" form="voucher-group-form">
              {t('voucher.createVoucherGroup')}
            </Button>
            {isOpen && (
              <ConfirmCreateVoucherGroupDialog
                voucherGroup={formData}
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
