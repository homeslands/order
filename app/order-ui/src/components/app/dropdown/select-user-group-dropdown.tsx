import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UsersIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
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

  return (
    <Select
      value={userGroupSlug ?? 'all'}
      onValueChange={(value) => handleSelectChange(value)}
    >
      <SelectTrigger className="w-fit gap-2" disabled={isLoading}>
        <UsersIcon className="h-[1.1rem] w-[1.1rem]" />
        <SelectValue
          className="text-xs"
          placeholder={t('customer.userGroup.chooseUserGroup')}
        />
      </SelectTrigger>
      <SelectContent className="w-56">
        <SelectItem value="all">
          <span className="text-xs">{t('customer.userGroup.chooseUserGroup')}</span>
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
  )
}
