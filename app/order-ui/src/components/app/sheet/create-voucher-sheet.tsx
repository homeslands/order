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
import { CreateVoucherDialog } from '@/components/app/dialog'
import { ICreateVoucherRequest } from '@/types'
import { SimpleDatePicker } from '../picker'
import { createVoucherSchema, TCreateVoucherSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'

export default function CreateVoucherSheet() {
  const { t } = useTranslation(['voucher'])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<ICreateVoucherRequest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<TCreateVoucherSchema>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      code: '',
      maxUsage: 0,
      minOrderValue: 0
    }
  })

  const handleDateChange = (fieldName: 'startDate' | 'endDate', date: string) => {
    form.setValue(fieldName, date)
  }

  const handleSubmit = (data: ICreateVoucherRequest) => {
    setFormData(data)
    setIsOpen(true)
  }

  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      code: '',
      maxUsage: 0,
      minOrderValue: 0
    })
  }

  const formFields = {
    name: (
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.name')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('voucher.enterVoucherName')} />
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
            <FormLabel className='flex items-center gap-1'>
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
    startDate: (
      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.startDate')}</FormLabel>
            <FormControl>
              <SimpleDatePicker {...field} onChange={(date) => handleDateChange('startDate', date)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    endDate: (
      <FormField
        control={form.control}
        name="endDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.endDate')}</FormLabel>
            <FormControl>
              <SimpleDatePicker {...field} onChange={(date) => handleDateChange('startDate', date)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    code: (
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.code')}</FormLabel>
            <FormControl>
              <Input
                type="text"
                {...field}
                placeholder={t('voucher.enterVoucherCode')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    maxUsage: (
      <FormField
        control={form.control}
        name="maxUsage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.maxUsage')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min={0}
                placeholder={t('voucher.enterVoucherMaxUsage')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    minOrderValue: (
      <FormField
        control={form.control}
        name="minOrderValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.minOrderValue')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                placeholder={t('voucher.enterMinOrderValue')}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min={0}
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
        <Button>
          <PlusCircle size={16} />
          {t('voucher.create')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.create')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 p-4 bg-muted-foreground/10">
            {/* Voucher name and description */}
            <div className="flex flex-col flex-1">
              <Form {...form}>
                <form id="voucher-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Nhóm: Tên và Mô tả */}
                  <div className="p-4 bg-white border rounded-md">
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.name}
                      {formFields.description}
                    </div>
                  </div>

                  {/* Nhóm: Ngày bắt đầu và Kết thúc */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white border rounded-md">
                    {formFields.startDate}
                    {formFields.endDate}
                  </div>

                  {/* Nhóm: Mã giảm giá & Số lượng */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white border rounded-md">
                    {formFields.code}
                    {formFields.maxUsage}
                  </div>

                  {/* Nhóm: Giá trị đơn hàng tối thiểu */}
                  <div className="p-4 bg-white border rounded-md">
                    {formFields.minOrderValue}
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button type="submit" form="voucher-form">
              {t('voucher.create')}
            </Button>
            {isOpen && (
              <CreateVoucherDialog
                voucher={formData}
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
