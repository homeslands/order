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
  Textarea,
} from '@/components/ui'
import { TCreateGiftCardSchema, createGiftCardSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateGiftCard } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { QUERYKEY } from '@/constants'
import { GiftCardStatusSelect } from '@/components/app/select'
import { GiftCardStatus } from '@/constants'
import { IGiftCardCreateRequest } from '@/types'

export default function CreateGiftCardSheet() {
  const { t } = useTranslation(['giftCard', 'common'])
  const [sheetOpen, setSheetOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutate, isPending } = useCreateGiftCard()

  const form = useForm<TCreateGiftCardSchema>({
    resolver: zodResolver(createGiftCardSchema),
    defaultValues: {
      title: '',
      description: '',
      file: undefined,
      points: 0,
      price: 0,
      isActive: true,
    },
  })

  const handleSubmit = (data: TCreateGiftCardSchema) => {
    const formData = new FormData()

    formData.append('title', data.title)
    formData.append('description', data.description || '')
    formData.append('points', data.points.toString())
    formData.append('price', data.price.toString())
    formData.append('isActive', data.isActive.toString())

    if (data.file) {
      formData.append('file', data.file)
    }

    mutate(formData as IGiftCardCreateRequest, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERYKEY.giftCards] })
        setSheetOpen(false)
        form.reset()
      },
    })
  }

  const formFields = {
    title: (
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('giftCard.title')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('giftCard.enterGiftCardTitle')}
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
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              {t('giftCard.image')}
            </FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => field.onChange(e.target.files?.[0] || null)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    points: (
      <FormField
        control={form.control}
        name="points"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('giftCard.points')}
            </FormLabel>
            <FormControl>
              <Input {...field} type="number" min={1} />
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
              <span className="text-destructive">*</span>
              {t('giftCard.price')}
            </FormLabel>
            <FormControl>
              <Input {...field} type="number" min={1} />
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
              <span className="text-destructive">*</span>
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
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle size={16} />
          {t('giftCard.create')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('giftCard.createTitle')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 bg-muted-foreground/10 p-4">
            <div className="flex flex-1 flex-col">
              <Form {...form}>
                <form
                  id="gift-card-form"
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  {' '}
                  <div className="rounded-md border bg-white p-4">
                    {' '}
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.title}
                      {formFields.description}
                      {formFields.file}
                    </div>
                  </div>
                  <div className="rounded-md border bg-white p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {formFields.points}
                      {formFields.price}
                    </div>
                  </div>
                  <div className="rounded-md border bg-white p-4">
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
              {t('giftCard.create')}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
