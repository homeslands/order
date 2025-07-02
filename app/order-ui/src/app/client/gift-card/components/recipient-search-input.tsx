import { useEffect, useState, useRef, useCallback } from 'react'
import { User2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { IUserInfo } from '@/types'
import { useDebouncedInput, usePagination, useUsers } from '@/hooks'
import { Input } from '@/components/ui'
import { Role } from '@/constants'

interface RecipientSearchInputProps {
  value: string
  onChange: (value: string) => void
  onUserSelect?: (user: IUserInfo | null) => void
  placeholder?: string
  className?: string
  onSelectionChange?: (hasSelectedUser: boolean) => void
  userInfo?: IUserInfo | null // Add userInfo prop to display phone when slug is saved
}

export default function RecipientSearchInput({
  value,
  onChange,
  onUserSelect,
  placeholder,
  className,
  onSelectionChange,
  userInfo,
}: RecipientSearchInputProps) {
  const { t } = useTranslation(['giftCard'])
  const [users, setUsers] = useState<IUserInfo[]>([])
  const [selectedUser, setSelectedUser] = useState<IUserInfo | null>(null)
  const { pagination, setPagination } = usePagination()
  const { inputValue, setInputValue, debouncedInputValue } = useDebouncedInput()
  const userListRef = useRef<HTMLDivElement>(null)

  // Helper function to check if we should search
  const searchCondition =
    debouncedInputValue && !selectedUser && debouncedInputValue.length === 10
  const { data: userByPhoneNumber } = useUsers(
    searchCondition
      ? {
          order: 'DESC',
          page: pagination.pageIndex,
          size: pagination.pageSize,
          phonenumber: debouncedInputValue,
          role: Role.CUSTOMER,
          hasPaging: true,
        }
      : null,
  )
  const handleSelectUser = useCallback(
    (user: IUserInfo) => () => {
      setSelectedUser(user)
      setUsers([])
      setInputValue(user.phonenumber)
      onChange(user.slug || '')
      onUserSelect?.(user)
    },
    [onChange, onUserSelect, setInputValue, setSelectedUser, setUsers],
  )

  // Initialize input value from parent value only once
  useEffect(() => {
    // Notify parent component about user selection state change
    if (onSelectionChange) {
      onSelectionChange(!!selectedUser)
    }

    // If userInfo is provided and we should restore the selected state
    if (userInfo) {
      handleSelectUser(userInfo)()
      return
    }

    // Initialize input with parent value if input is empty and no user selected
    if (value && !selectedUser && inputValue === '') {
      setInputValue(value)
    }
  }, [
    value,
    selectedUser,
    inputValue,
    setInputValue,
    onSelectionChange,
    userInfo,
    handleSelectUser,
  ]) // Don't sync back to parent automatically - only when user selects someone
  // The parent form will handle the typing input directly
  useEffect(() => {
    if (!searchCondition || selectedUser) {
      setUsers([])
    } else if (userByPhoneNumber?.result?.items) {
      if (pagination.pageIndex === 1) {
        setUsers(userByPhoneNumber.result.items)
      } else {
        setUsers((prev) => [...prev, ...userByPhoneNumber.result.items])
      }
    }
  }, [searchCondition, userByPhoneNumber, pagination.pageIndex, selectedUser])
  const handleScroll = () => {
    if (userListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = userListRef.current
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: prev.pageIndex + 1,
        }))
      }
    }
  }

  return (
    <div className="relative flex flex-col gap-3">
      {/* Recipient Input */}
      <div className="flex flex-col gap-1">
        {' '}
        <div className="relative">
          <Input
            className={className}
            placeholder={placeholder || t('giftCard.enterReceiverPhone')}
            value={inputValue}
            onChange={(e) => {
              const newValue = e.target.value
              // Only allow numeric characters and limit to 10 digits
              const numericValue = newValue.replace(/\D/g, '').slice(0, 10)
              setInputValue(numericValue)
              if (selectedUser) {
                setSelectedUser(null)
                onUserSelect?.(null)
              }
              // Call parent onChange directly
              onChange(numericValue)
            }}
            maxLength={10}
            type="tel"
          />
          {/* Character counter */}
          {inputValue && inputValue.length < 10 && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {inputValue.length}/10
            </div>
          )}
        </div>{' '}
        {/* Helper text */}
        {inputValue && inputValue.length > 0 && inputValue.length < 10 && (
          <div className="text-xs text-gray-500">
            {t('giftCard.enterReceiverPhoneHelper')} ({10 - inputValue.length}{' '}
            {t('giftCard.numbersRemaining')})
          </div>
        )}
        {/* Phone not found message */}
        {inputValue &&
          inputValue.length === 10 &&
          !selectedUser &&
          searchCondition &&
          userByPhoneNumber &&
          userByPhoneNumber.result?.items?.length === 0 && (
            <div className="text-xs text-red-500">
              {t('giftCard.phoneNumberNotFound')}
            </div>
          )}
      </div>{' '}
      {/* User list dropdown */}
      {users.length > 0 && searchCondition && (
        <div
          ref={userListRef}
          onScroll={handleScroll}
          className="absolute z-50 mt-11 max-h-96 w-full overflow-y-auto rounded-md border bg-white shadow-lg dark:bg-gray-800"
        >
          {users.map((user, index) => (
            <div
              key={user.slug}
              onClick={handleSelectUser(user)}
              className={`flex cursor-pointer items-center gap-2 rounded-md p-2 transition-all duration-300 hover:bg-primary/20 ${index < users.length - 1 ? 'border-b' : ''}`}
            >
              <div className="flex items-center justify-center rounded-full bg-primary/10 p-2">
                <User2Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-bold text-muted-foreground">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-muted-foreground xl:text-sm">
                  {user.phonenumber}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
