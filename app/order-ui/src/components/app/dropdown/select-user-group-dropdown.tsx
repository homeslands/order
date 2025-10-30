import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RotateCcw, UsersIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useUserGroups } from '@/hooks'
import { IUserGroup } from '@/types'

export default function SelectUserGroupDropdown() {
  const { t } = useTranslation('customer')
  const { data: userGroups, isLoading } = useUserGroups({
    hasPaging: false,
  }, true)

  const userGroupsData = useMemo(() => userGroups?.result.items, [userGroups])
  // get user group from params
  const [searchParams, setSearchParams] = useSearchParams()
  const userGroupSlug = searchParams.get('userGroup')
  const isAppliedUserGroupParam = searchParams.get('isAppliedUserGroup')
  const isAppliedUserGroup = isAppliedUserGroupParam ?? 'all'

  useMemo(() => {
    // compute selected group if needed later for side-effects or memoized label
    return userGroupsData && userGroupSlug
      ? userGroupsData.find((item: IUserGroup) => item.slug === userGroupSlug) || null
      : null
  }, [userGroupsData, userGroupSlug])

  const handleSelectChange = (value: string) => {
    if (value === (userGroupSlug || 'all')) return
    const next = new URLSearchParams(searchParams)
    if (value !== 'all') {
      next.set('userGroup', value)
    } else {
      next.delete('userGroup')
    }
    setSearchParams(next, { replace: true })
  }

  const handleReset = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('userGroup')
    next.delete('isAppliedUserGroup')
    setSearchParams(next, { replace: true })
  }

  // Điều kiện hiển thị option "Tất cả" cho user group: chỉ khi isAppliedUserGroup !== 'true'
  const showAllOptionForUserGroup = isAppliedUserGroup !== 'true'

  return (
    <div className="flex gap-2 items-center">
      <Select
        value={userGroupSlug ?? (showAllOptionForUserGroup ? 'all' : userGroupsData?.[0]?.slug)}
        onValueChange={(value) => handleSelectChange(value)}
      >
        <SelectTrigger className="gap-2 w-fit" disabled={isLoading}>
          <UsersIcon className="h-[1.1rem] w-[1.1rem]" />
          <SelectValue
            className="text-xs"
            placeholder={t('customer.userGroup.chooseUserGroup')}
          />
        </SelectTrigger>
        <SelectContent className="w-56">
          <SelectItem value="all">
            <span className="text-xs">{t('customer.userGroup.all')}</span>
          </SelectItem>
          {userGroupsData && userGroupsData.map((item) => {
            return (
              <SelectItem value={item.slug} key={item.slug}>
                <span className="text-xs">{item.name}</span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        className="gap-2 h-8"
        onClick={handleReset}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span className="text-xs">{t('customer.userGroup.reset')}</span>
      </Button>
    </div>
  )
}
