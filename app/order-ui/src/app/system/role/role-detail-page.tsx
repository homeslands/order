import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useGetAuthorityGroup, useRoleBySlug } from '@/hooks'
import { RoleDetailSkeleton } from '@/components/app/skeleton'
import { Switch, Label, Badge } from '@/components/ui'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components'
import { ICreatePermissionRequest } from '@/types'
import { useState } from 'react'
import { ConfirmCreatePermissionDialog } from '@/components/app/dialog'

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

interface IPermission {
    authority: IAuthority;
    createdAt: string;
    slug: string;
}

const AuthorityGroup = ({
    group,
    permissions,
    onPermissionChange
}: {
    group: IAuthorityGroup;
    permissions: IPermission[];
    onPermissionChange: (data: ICreatePermissionRequest) => void;
}) => {
    const { slug } = useParams()
    const [permissionData, setPermissionData] = useState<ICreatePermissionRequest>({
        role: slug as string,
        createAuthorities: [],
        deleteAuthorities: []
    })

    const hasPermission = (slug: string) => {
        const initialPermission = permissions?.some(p => p.authority.slug === slug)
        const isPendingCreate = permissionData.createAuthorities.includes(slug)
        const isPendingDelete = permissionData.deleteAuthorities.includes(slug)

        return (initialPermission && !isPendingDelete) || (!initialPermission && isPendingCreate)
    }

    const handleClickSwitch = (authority: string) => {
        setPermissionData(prev => {
            const isCurrentlyEnabled = hasPermission(authority)
            const newData = { ...prev }

            // Remove from both arrays first
            newData.createAuthorities = newData.createAuthorities.filter(a => a !== authority)
            newData.deleteAuthorities = newData.deleteAuthorities.filter(a => a !== authority)

            // Add to appropriate array based on current state
            if (isCurrentlyEnabled) {
                newData.deleteAuthorities.push(authority)
            } else {
                newData.createAuthorities.push(authority)
            }

            onPermissionChange(newData)
            return newData
        })
    }

    const permissionCount = group.authorities.reduce((count, authority) => {
        return count + (hasPermission(authority.slug) ? 1 : 0)
    }, 0)

    const isAllSelected = permissionCount === group.authorities.length
    const { t } = useTranslation(['common'])

    return (
        <AccordionItem value={group.slug} className="border rounded-lg border-primary/40">
            <AccordionTrigger className="flex items-center justify-between p-4 hover:no-underline hover:bg-primary/5">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <h3 className="text-md text-muted-foreground">{group.name}</h3>
                        <span className="px-4 py-1 text-sm rounded-md text-primary bg-primary/20">
                            {permissionCount}/{group.authorities.length}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <Label className="text-sm text-muted-foreground">
                            {t('common.selectAll')}
                        </Label>
                        <Switch
                            checked={isAllSelected}
                            disabled
                            onClick={(e) => e.stopPropagation()}
                            className="ml-4"
                        />
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className='px-4'>
                <div className="grid gap-3">
                    {group.authorities.map((authority: IAuthority) => (
                        <div
                            key={authority.slug}
                            className="flex items-center justify-between px-0 py-1 transition-colors rounded-md"
                        >
                            <Label
                                htmlFor={authority.slug}
                                className="flex-1 cursor-pointer"
                            >
                                {authority.name}
                            </Label>
                            <Switch
                                id={authority.slug}
                                checked={hasPermission(authority.slug)}
                                onClick={() => handleClickSwitch(authority.slug)}
                                className="ml-4"
                            />
                        </div>
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

export default function RoleDetailPage() {
    const { t } = useTranslation(['role'])
    const { t: tHelmet } = useTranslation('helmet')
    const { slug } = useParams()
    const { data: role, isLoading, refetch } = useRoleBySlug(slug as string)
    const { data: authority } = useGetAuthorityGroup({
        role: slug,
        inRole: true,
    })

    const roleDetail = role?.result
    const authorityGroups = authority?.result as IAuthorityGroup[]

    const [selectedPermission, setSelectedPermission] = useState<ICreatePermissionRequest | null>(null)

    const handlePermissionChange = (data: ICreatePermissionRequest) => {
        setSelectedPermission(data)
    }

    if (isLoading) {
        return <RoleDetailSkeleton />
    }

    return (
        <div className="flex flex-col gap-3">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.role.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.role.title')} />
            </Helmet>

            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <SquareMenu className="w-6 h-6" />
                        <p>{t('role.title')}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted-foreground'>{t(`role.name`)}</span>
                        <Badge className='text-sm font-normal'>{t(`role.${roleDetail?.name}`)}</Badge>
                    </div>
                    <ConfirmCreatePermissionDialog onSuccess={() => refetch()} permission={selectedPermission} />
                    {/* <Input className='col-span-9 text-primary' value={t(`role.${roleDetail?.name}`)} readOnly /> */}
                </div>
            </div>

            {/* Permissions List */}
            <h2 className="text-lg font-semibold">
                {t('role.authorityList')}
            </h2>
            <div className="p-4 mb-4 border rounded-md shadow-lg">
                <Accordion type="multiple" className="space-y-4">
                    {authorityGroups?.map((group: IAuthorityGroup) => (
                        <AuthorityGroup
                            key={group.slug}
                            group={group}
                            permissions={roleDetail?.permissions || []}
                            onPermissionChange={handlePermissionChange}
                        />
                    ))}
                </Accordion>
            </div>
        </div>
    )
}
