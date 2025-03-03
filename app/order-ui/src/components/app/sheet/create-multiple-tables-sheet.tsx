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
import { CreateMultipleTablesDialog } from '@/components/app/dialog'
import { ICreateMultipleTablesRequest } from '@/types'
import { createMultipleTablesSchema, TCreateMultipleTablesSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUserStore } from '@/stores'

export default function CreateMultipleTablesSheet() {
  const { t } = useTranslation(['table'])
  const { userInfo } = useUserStore()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<ICreateMultipleTablesRequest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<TCreateMultipleTablesSchema>({
    resolver: zodResolver(createMultipleTablesSchema),
    defaultValues: {
      branch: userInfo?.branch.slug || '',
      from: 1,
      to: 2,
      step: 1,
    },
  })

  const resetForm = () => {
    form.reset({
      branch: userInfo?.branch.slug || '',
      from: 1,
      to: 2,
      step: 1,
    })
  }

  const handleSubmit = (data: ICreateMultipleTablesRequest) => {
    setFormData(data)
    setIsOpen(true)
  }

  const formFields = {
    from: (
      <FormField
        control={form.control}
        name="from"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('table.rangeFrom')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t('table.enterRangeFrom')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    to: (
      <FormField
        control={form.control}
        name="to"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('table.rangeTo')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t('table.enterRangeTo')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    step: (
      <FormField
        control={form.control}
        name="step"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('table.step')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t('table.enterRangeStep')}
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
        <Button
          className='h-10'
          variant='outline'
        >
          <PlusCircle size={16} />
          {t('table.createMultipleTables')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('table.createMultipleTables')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 bg-muted-foreground/10 p-4">
            {/* Voucher name and description */}
            <div className="flex flex-col flex-1">
              <Form {...form}>
                <form
                  id="multiple-tables-form"
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  {/* Group: Starting and Ending Table Numbers */}
                  <div className={`p-4 bg-white dark:bg-transparent border rounded-md`}>
                    <div className="grid grid-cols-2 gap-2">
                      {formFields.from}
                      {formFields.to}
                    </div>
                  </div>

                  {/* Group: Starting and Ending Table Numbers */}
                  <div className={`grid grid-cols-1 gap-2 p-4 bg-white dark:bg-transparent border rounded-md`}>
                    {formFields.step}
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button type="submit" form="multiple-tables-form">
              {t('table.createMultipleTables')}
            </Button>
            {isOpen && (
              <CreateMultipleTablesDialog
                tables={formData}
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
