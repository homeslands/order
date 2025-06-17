import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PenLine } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

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
  Textarea,
} from '@/components/ui'
import { IGiftCard, IGiftCardUpdateRequest } from '@/types'
import { GiftCardStatus, publicFileURL, QUERYKEY } from '@/constants'
import { SortOperation } from '@/constants'
import { TUpdateGiftCardSchema, updateGiftCardSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { GiftCardStatusSelect } from '@/components/app/select'
import { useUpdateGiftCard } from '@/hooks'
import { showToast } from '@/utils'
import { useSortContext } from '@/contexts'
import { Tooltip } from 'react-tooltip'
import { ImageUploader } from '../upload'
import { NumberFormatValues, NumericFormat } from 'react-number-format'

interface IUpdateGiftCardSheetProps {
  giftCard: IGiftCard
}

export default function UpdateGiftCardSheet({
  giftCard,
}: IUpdateGiftCardSheetProps) {
  const { t } = useTranslation(['giftCard', 'common'])
  const { t: tToast } = useTranslation('toast')
  const [sheetOpen, setSheetOpen] = useState(false)
  const queryClient = useQueryClient()
  const { mutate, isPending } = useUpdateGiftCard()
  const { onSort } = useSortContext()

  const defaultFormValues = {
    slug: giftCard.slug,
    title: giftCard.title,
    description: giftCard.description,
    file: undefined,
    points: Number(giftCard.points),
    price: Number(giftCard.price),
    isActive: giftCard.isActive,
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      form.reset(defaultFormValues)
    }
  }

  const form = useForm<TUpdateGiftCardSchema>({
    resolver: zodResolver(updateGiftCardSchema),
    defaultValues: defaultFormValues,
  })

  const handleSubmit = (data: TUpdateGiftCardSchema) => {
    // Create a FormData object for file uploads
    const formDataObj = new FormData()
    formDataObj.append('title', data.title)
    formDataObj.append('description', data.description || '')
    formDataObj.append('points', data.points.toString())
    formDataObj.append('price', data.price.toString())
    formDataObj.append('isActive', data.isActive.toString())

    // Append file only if it exists
    if (data.file) {
      formDataObj.append('file', data.file)
    }

    // Update gift card directly without confirmation
    mutate(
      {
        data: formDataObj as IGiftCardUpdateRequest,
        slug: data.slug,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [QUERYKEY.giftCards] })
          setSheetOpen(false)
          showToast(tToast('toast.updateGiftCardSuccess'))
          if (onSort) {
            onSort(SortOperation.UPDATE)
          }
        },
      },
    )
  }

  const formFields = {
    title: (
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive dark:text-red-400">*</span>
              {t('giftCard.title')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('giftCard.enterGiftCardTitle')}
                maxLength={256}
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
              {t('giftCard.description')}
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('giftCard.enterGiftCardDescription')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    file: (
      <FormField
        control={form.control}
        name="file"
        render={({ field }) => {
          const initialImage = giftCard.image
            ? `${publicFileURL}/${giftCard.image}`
            : null
          return (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                {t('giftCard.image')}
              </FormLabel>
              <FormControl>
                <ImageUploader
                  initialImage={initialImage}
                  onFileChange={(file) => field.onChange(file)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    ),
    points: (
      <FormField
        control={form.control}
        name="points"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive dark:text-red-400">*</span>
              {t('giftCard.points')}
            </FormLabel>
            <FormControl>
              <NumericFormat
                thousandSeparator
                allowNegative={false}
                customInput={Input}
                onValueChange={(values: NumberFormatValues) => {
                  field.onChange(values.floatValue ?? 0)
                }}
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    price: (
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive dark:text-red-400">*</span>
              {t('giftCard.price')}
            </FormLabel>
            <FormControl>
              <NumericFormat
                thousandSeparator
                allowNegative={false}
                customInput={Input}
                onValueChange={(values: NumberFormatValues) => {
                  field.onChange(values.floatValue ?? 0)
                }}
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    isActive: (
      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive dark:text-red-400">*</span>{' '}
              {t('giftCard.status')}
            </FormLabel>
            <FormControl>
              <GiftCardStatusSelect
                value={
                  field.value ? GiftCardStatus.ACTIVE : GiftCardStatus.INACTIVE
                }
                onChange={(value) =>
                  field.onChange(value === GiftCardStatus.ACTIVE)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
  }
  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <div
          data-tooltip-id="update-card"
          data-tooltip-content={t('giftCard.update')}
        >
          <PenLine className="icon text-blue-500" />
          <Tooltip id="update-card" variant="light" />
        </div>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-foreground">
            {t('giftCard.update')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 bg-muted/50 p-4">
            <div className="flex flex-1 flex-col">
              <Form {...form}>
                <form
                  id="gift-card-form"
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <div className="rounded-md border bg-card p-4">
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.title}
                      {formFields.description}
                      {formFields.file}
                    </div>
                  </div>
                  <div className="rounded-md border bg-card p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {formFields.points}
                      {formFields.price}
                    </div>
                  </div>
                  <div className="rounded-md border bg-card p-4">
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.isActive}
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button type="submit" form="gift-card-form" disabled={isPending}>
              {t('giftCard.update')}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
