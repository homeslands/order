import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useGetAuthorityGroup, useRoleBySlug } from '@/hooks'
import { RoleDetailSkeleton } from '@/components/app/skeleton'
import { Switch, Label, Badge } from '@/components/ui'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components'
import { IAuthority, IAuthorityGroup, ICreatePermissionRequest, IPermission } from '@/types'
import { ConfirmCreatePermissionDialog } from '@/components/app/dialog'

const AuthorityGroup = ({
    group,
    permissions,
    groupPermissionData,
    onPermissionChange
}: {
    group: IAuthorityGroup;
    permissions: IPermission[];
    groupPermissionData: ICreatePermissionRequest;
    onPermissionChange: (data: ICreatePermissionRequest) => void;
}) => {
    const hasPermission = (slug: string) => {
        const initialPermission = permissions?.some(p => p.authority.slug === slug)
        const isPendingCreate = groupPermissionData.createAuthorities.includes(slug)
        const isPendingDelete = groupPermissionData.deleteAuthorities.includes(slug)

        return (initialPermission && !isPendingDelete) || (!initialPermission && isPendingCreate)
    }

    const handleClickSwitch = (authority: string) => {
        const isCurrentlyEnabled = hasPermission(authority)
        const newData = { ...groupPermissionData }

        // Remove from both arrays first
        newData.createAuthorities = newData.createAuthorities.filter(a => a !== authority)
        newData.deleteAuthorities = newData.deleteAuthorities.filter(a => a !== authority)

        if (isCurrentlyEnabled) {
            newData.deleteAuthorities.push(authority)
        } else {
            newData.createAuthorities.push(authority)
        }

        onPermissionChange(newData)
    }

    const handleClickAll = () => {
        const isAllSelected = group.authorities.every(authority => hasPermission(authority.slug))
        const newData = { ...groupPermissionData }

        group.authorities.forEach(authority => {
            newData.createAuthorities = newData.createAuthorities.filter(a => a !== authority.slug)
            newData.deleteAuthorities = newData.deleteAuthorities.filter(a => a !== authority.slug)

            const hasInitialPermission = permissions?.some(p => p.authority.slug === authority.slug)

            if (isAllSelected) {
                if (hasInitialPermission) {
                    newData.deleteAuthorities.push(authority.slug)
                }
            } else {
                if (!hasInitialPermission) {
                    newData.createAuthorities.push(authority.slug)
                }
            }
        })

        onPermissionChange(newData)
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
                            onClick={() => handleClickAll()}
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

    const [permissionData, setPermissionData] = useState<ICreatePermissionRequest>({
        role: slug as string,
        createAuthorities: [],
        deleteAuthorities: []
    })

    const handlePermissionChange = (newGroupData: ICreatePermissionRequest) => {
        setPermissionData(prev => {
            // Keep permissions from other groups and combine with new group changes
            const otherGroupsCreate = prev.createAuthorities.filter(
                a => !newGroupData.createAuthorities.includes(a) && !newGroupData.deleteAuthorities.includes(a)
            )
            const otherGroupsDelete = prev.deleteAuthorities.filter(
                a => !newGroupData.createAuthorities.includes(a) && !newGroupData.deleteAuthorities.includes(a)
            )

            return {
                role: slug as string,
                createAuthorities: [...otherGroupsCreate, ...newGroupData.createAuthorities],
                deleteAuthorities: [...otherGroupsDelete, ...newGroupData.deleteAuthorities]
            }
        })
    }

    // Update selectedPermission whenever permissionData changes
    useEffect(() => {
        setSelectedPermission(permissionData)
    }, [permissionData])

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
                            groupPermissionData={permissionData}
                            onPermissionChange={handlePermissionChange}
                        />
                    ))}
                </Accordion>
            </div>
        </div>
    )
}
