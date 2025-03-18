import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PlusCircle, Loader2 } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  Form,
  Switch,
  Label,
} from '@/components/ui'
import { useGetAuthorityGroup } from '@/hooks'
import { addPermissionSchema, TAddPermissionSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'
import { ConfirmCreatePermissionDialog } from '../dialog'

interface IAuthority {
  name: string;
  description: string | null;
  createdAt: string;
  slug: string;
}

interface IAuthorityGroup {
  name: string;
  code: string;
  description: string | null;
  authorities: IAuthority[];
  createdAt: string;
  slug: string;
}

export default function AddPermissionSheet({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation(['role'])
  const { t: tCommon } = useTranslation(['common'])
  const [isOpen, setIsOpen] = useState(false)
  const { slug } = useParams()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { data: authority, isLoading, refetch } = useGetAuthorityGroup({
    role: slug,
    inRole: true,
  })

  const form = useForm<TAddPermissionSchema>({
    resolver: zodResolver(addPermissionSchema),
    defaultValues: {
      role: slug,
      authorities: [],
    },
  })

  const authorityGroups = authority?.result

  const handleAuthorityToggle = (slug: string) => {
    const currentAuthorities = form.getValues('authorities')
    const newAuthorities = currentAuthorities.includes(slug)
      ? currentAuthorities.filter(s => s !== slug)
      : [...currentAuthorities, slug]

    form.setValue('authorities', newAuthorities, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetOpen(true)
  }

  const AuthorityGroup = ({ group }: { group: IAuthorityGroup }) => {
    const authorities = form.watch('authorities')
    return (
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">{group.name}</h3>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
            {group.code}
          </span>
        </div>
        <div className="grid gap-3">
          {group.authorities.map(authority => (
            <div
              key={authority.slug}
              className="flex items-center justify-between p-2 transition-colors rounded-md hover:bg-accent"
            >
              <Label
                htmlFor={authority.slug}
                className="flex-1 cursor-pointer"
              >
                {authority.name}
              </Label>
              <Switch
                id={authority.slug}
                checked={authorities.includes(authority.slug)}
                onCheckedChange={() => handleAuthorityToggle(authority.slug)}
                className="ml-4"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    setIsOpen(true)
  }

  const handleCreatePermissionSuccess = async () => {
    await refetch()
    form.reset()
    setIsOpen(false)
    setSheetOpen(false)
    onSuccess()
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          className="justify-start w-full gap-1 px-2"
          onClick={handleClick}
        >
          <PlusCircle className="icon" />
          {t('role.addPermission')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-2xl font-semibold text-primary">
            {t('role.addPermission')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100vh-6rem)]">
          <ScrollArea className="flex-1 px-6">
            <Form {...form}>
              <form
                id="permission-form"
                onSubmit={form.handleSubmit(handleSubmit)}
                className="py-6 space-y-6"
              >
                <div className="space-y-6">
                  {/* {formFields.role} */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">{t('role.permissions')}</h2>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {authorityGroups?.map(group => (
                          <AuthorityGroup key={group.slug} group={group} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </ScrollArea>
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-background">
            <Button
              variant="outline"
              onClick={() => setSheetOpen(false)}
            >
              {tCommon('common.cancel')}
            </Button>
            <ConfirmCreatePermissionDialog
              isOpen={isOpen}
              onOpenChange={setIsOpen}
              disabled={isLoading || form.watch('authorities').length === 0}
              permission={{
                role: slug || '',
                authorities: form.watch('authorities')
              }}
              onSuccess={handleCreatePermissionSuccess}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
