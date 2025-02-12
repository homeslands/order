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
import { UpdatePromotionDialog } from '@/components/app/dialog'
import { IPromotion, IUpdatePromotionRequest } from '@/types'
import { SimpleDatePicker } from '../picker'
import { TUpdatePromotionSchema, updatePromotionSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUserStore } from '@/stores'

interface IUpdatePromotionSheetProps {
  promotion: IPromotion
}

export default function UpdatePromotionSheet({
  promotion,
}: IUpdatePromotionSheetProps) {
  const { t } = useTranslation(['promotion'])
  const { userInfo } = useUserStore()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<IUpdatePromotionRequest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<TUpdatePromotionSchema>({
    resolver: zodResolver(updatePromotionSchema),
    defaultValues: {
      slug: promotion.slug,
      branch: userInfo?.branch.slug || '',
      createdAt: promotion.createdAt,
      title: promotion.title,
      description: promotion.description,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      type: promotion.type,
      value: promotion.value,
    },
  })

  const isDateBeforeToday = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isDateBeforeStartDate = (date: Date) => {
    const startDate = form.getValues('startDate')
    if (!startDate) return false
    const startDateObj = new Date(startDate)
    return date <= startDateObj
  }

  const handleDateChange = (fieldName: 'startDate' | 'endDate', date: string) => {
    if (fieldName === 'startDate') {
      // Nếu thay đổi ngày bắt đầu, xóa ngày kết thúc nếu nó trước ngày bắt đầu mới
      const currentEndDate = form.getValues('endDate')
      if (currentEndDate && new Date(currentEndDate) <= new Date(date)) {
        form.setValue('endDate', '')
      }
    }
    form.setValue(fieldName, date)
  }

  const handleSubmit = (data: IUpdatePromotionRequest) => {
    setFormData(data)
    setIsOpen(true)
  }

  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      type: 'per-product',
      value: 0,
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
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('promotion.name')}
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('promotion.enterPromotionName')} />
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
              <span className="text-destructive">*</span>
              {t('promotion.description')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('promotion.enterPromotionDescription')}
              />
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
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('promotion.startDate')}
            </FormLabel>
            <FormControl>
              <SimpleDatePicker
                {...field}
                onChange={(date) => handleDateChange('startDate', date)}
                disabledDates={isDateBeforeToday}
              />
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
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('promotion.endDate')}
            </FormLabel>
            <FormControl>
              <SimpleDatePicker
                {...field}
                onChange={(date) => handleDateChange('endDate', date)}
                disabledDates={isDateBeforeStartDate}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    type: (
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('promotion.type')}
            </FormLabel>
            <FormControl>
              <Input
                defaultValue={t('voucher.defaultPromotionType')}
                type="text"
                {...field}
                placeholder={t('voucher.selectPromotionType')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    value: (
      <FormField
        control={form.control}
        name="value"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('promotion.value')}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => {
                  const displayValue = Number(e.target.value)
                  if (displayValue >= 0 && displayValue <= 100) {
                    field.onChange(displayValue)
                  }
                }}
                min={0}
                max={100}
                placeholder={t('promotion.enterPromotionValue')}
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
          {t('promotion.update')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('promotion.update')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 bg-muted-foreground/10 p-4">
            {/* Voucher name and description */}
            <div className="flex flex-col flex-1">
              <Form {...form}>
                <form
                  id="promotion-form"
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
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

                  {/* Nhóm: Kiểu khuyến mãi và giá trị khuyến mãi */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white border rounded-md">
                    {formFields.type}
                    {formFields.value}
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button type="submit" form="promotion-form">
              {t('promotion.update')}
            </Button>
            {isOpen && (
              <UpdatePromotionDialog
                promotion={formData}
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
