import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { SquareMenu } from 'lucide-react';

import { useGetAuthorityGroup, useRoleBySlug } from '@/hooks';
import { RoleDetailSkeleton } from '@/components/app/skeleton';
import { Switch, Label, Badge, Button } from '@/components/ui';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components';
import { IAuthorityGroup, ICreatePermissionRequest } from '@/types';
import { ConfirmCreatePermissionDialog } from '@/components/app/dialog';

export default function RoleDetailPage() {
    const { t } = useTranslation(['role']);
    const { t: tCommon } = useTranslation('common');
    const { t: tHelmet } = useTranslation('helmet');
    const { slug } = useParams();
    const { data: role, isLoading, refetch } = useRoleBySlug(slug as string);
    const { data: authority } = useGetAuthorityGroup({ role: slug, inRole: true });

    const roleDetail = role?.result;
    const authorityGroups = authority?.result as IAuthorityGroup[];

    const [selectedPermissions, setSelectedPermissions] = useState<ICreatePermissionRequest>({
        role: slug as string,
        createAuthorities: [],
        deleteAuthorities: []
    });

    const handlePermissionToggle = (authoritySlug: string, isChecked: boolean) => {
        setSelectedPermissions((prev) => {
            const newPermissions = { ...prev };
            if (isChecked) {
                newPermissions.createAuthorities.push(authoritySlug);
                newPermissions.deleteAuthorities = newPermissions.deleteAuthorities.filter(a => a !== authoritySlug);
            } else {
                newPermissions.deleteAuthorities.push(authoritySlug);
                newPermissions.createAuthorities = newPermissions.createAuthorities.filter(a => a !== authoritySlug);
            }
            return newPermissions;
        });
    };

    const handleToggleAll = (group: IAuthorityGroup, isChecked: boolean) => {
        setSelectedPermissions((prev) => {
            const newPermissions = { ...prev };
            group.authorities.forEach(auth => {
                if (isChecked) {
                    if (!newPermissions.createAuthorities.includes(auth.slug)) newPermissions.createAuthorities.push(auth.slug);
                    newPermissions.deleteAuthorities = newPermissions.deleteAuthorities.filter(a => a !== auth.slug);
                } else {
                    if (!newPermissions.deleteAuthorities.includes(auth.slug)) newPermissions.deleteAuthorities.push(auth.slug);
                    newPermissions.createAuthorities = newPermissions.createAuthorities.filter(a => a !== auth.slug);
                }
            });
            return newPermissions;
        });
    };

    const isAuthorityActive = (authoritySlug: string) => {
        const existingPermission = roleDetail?.permissions?.some(p => p.authority.slug === authoritySlug);
        const isPendingCreate = selectedPermissions.createAuthorities.includes(authoritySlug);
        const isPendingDelete = selectedPermissions.deleteAuthorities.includes(authoritySlug);

        return (existingPermission && !isPendingDelete) || (!existingPermission && isPendingCreate);
    };

    const getGroupActiveCount = (group: IAuthorityGroup) => {
        return group.authorities.reduce((count, auth) =>
            count + (isAuthorityActive(auth.slug) ? 1 : 0), 0);
    };

    if (isLoading) return <RoleDetailSkeleton />;

    return (
        <div className="flex flex-col gap-3">
            <Helmet>
                <title>{tHelmet('helmet.role.title')}</title>
            </Helmet>
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center">
                    <div className="flex gap-2 items-center text-lg font-semibold">
                        <SquareMenu className="w-6 h-6" />
                        <p>{t('role.title')}</p>
                    </div>
                </div>
                <div className="flex gap-4 justify-between items-center">
                    <div className='flex gap-2 items-center'>
                        <span className='text-sm text-muted-foreground'>{t(`role.name`)}</span>
                        <Badge className='text-sm font-normal'>{roleDetail?.name}</Badge>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                        <Button variant="outline" onClick={() => setSelectedPermissions({
                            role: slug as string,
                            createAuthorities: [],
                            deleteAuthorities: []
                        })}>
                            {tCommon('common.cancel')}
                        </Button>
                        <ConfirmCreatePermissionDialog
                            onSuccess={refetch}
                            permission={selectedPermissions}
                        />
                    </div>
                </div>
                <span className='text-sm text-destructive'>{t('role.needLoginAgain')}</span>
            </div>
            <h2 className="text-lg font-semibold">{t('role.authorityList')}</h2>
            <Accordion type="multiple" className="space-y-4">
                {authorityGroups?.map(group => {
                    const activeCount = getGroupActiveCount(group);
                    const totalCount = group.authorities.length;

                    return (
                        <AccordionItem key={group.slug} value={group.slug} className="rounded-lg border border-primary/40">
                            <AccordionTrigger className="flex justify-between p-4 rounded-b-none border-b border-primary/40 hover:bg-primary/5">
                                <div className="flex gap-4 items-center">
                                    <span>{group.name}</span>
                                    <Badge className="text-xs bg-primary/20 text-primary">
                                        {activeCount}/{totalCount}
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className='px-4 py-2 space-y-2'>
                                <div className='flex gap-2 justify-end items-center'>
                                    <Label>
                                        {tCommon('common.selectAll')}
                                    </Label>
                                    <Switch
                                        checked={activeCount === totalCount}
                                        onCheckedChange={(checked) => handleToggleAll(group, checked)}
                                    />
                                </div>
                                {group.authorities.map(auth => (
                                    <div key={auth.slug} className="flex justify-between py-1">
                                        <Label>{auth.name}</Label>
                                        <Switch
                                            checked={isAuthorityActive(auth.slug)}
                                            onCheckedChange={(checked) =>
                                                handlePermissionToggle(auth.slug, checked)}
                                        />
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>


        </div>
    );
}
