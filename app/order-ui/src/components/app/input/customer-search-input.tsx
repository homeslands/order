import { useTranslation } from 'react-i18next'

import { useCartItemStore } from '@/stores'
import { useEffect, useState } from 'react'
import { IUserInfo } from '@/types'
import { useDebouncedInput, usePagination, useUsers } from '@/hooks'
import {
    Button, Input, Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui'
import { CircleX } from 'lucide-react'

export default function CustomerSearchInput() {
    const { t } = useTranslation(['menu'])
    const { t: tCommon } = useTranslation(['common'])
    const [users, setUsers] = useState<IUserInfo[]>([])
    const { pagination } = usePagination()
    const [selectedUser, setSelectedUser] = useState<IUserInfo | null>(null)
    const { inputValue, setInputValue, debouncedInputValue } = useDebouncedInput()
    const { getCartItems, addCustomerInfo, removeCustomerInfo } = useCartItemStore()
    const cartItems = getCartItems()

    const { data: userByPhoneNumber } = useUsers(
        debouncedInputValue
            ? {
                order: 'DESC',
                page: pagination.pageIndex,
                pageSize: pagination.pageSize,
                phonenumber: debouncedInputValue,
            }
            : null, // Not calling API if debouncedInputValue is empty
    )

    useEffect(() => {
        if (debouncedInputValue === '') {
            setUsers([])
        } else if (userByPhoneNumber?.result?.items) {
            setUsers(userByPhoneNumber.result.items)
        }
    }, [debouncedInputValue, userByPhoneNumber])


    const handleAddOwner = (user: IUserInfo) => () => {
        addCustomerInfo(user)
        setUsers([])
        setInputValue('')
        setSelectedUser(user)
    }

    // check if cartItems is null, setSelectedUser to null
    useEffect(() => {
        if (!cartItems) {
            setSelectedUser(null)
        }
    }, [cartItems])

    const handleRemoveOwner = () => {
        setSelectedUser(null)
        setInputValue('')
        removeCustomerInfo()
    }
    return (
        <div className='flex flex-col gap-3'>
            {/* Customer Information */}
            <div className="flex flex-col gap-3">
                <div className="relative">
                    <Input
                        placeholder={t('order.enterPhoneNumber')}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>
                {selectedUser && (
                    <div className='flex items-center gap-2'>
                        <span className='px-4 py-1 text-sm border rounded-full border-primary text-primary bg-primary/20 w-fit'>
                            {selectedUser.firstName} {selectedUser.lastName} - {selectedUser.phonenumber}
                        </span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost"
                                        onClick={() => handleRemoveOwner()}
                                    >
                                        <CircleX />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{tCommon('common.cancel')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>
            {/* User list dropdown */}
            {users.length > 0 && (
                <div className="absolute z-10 w-full p-2 mt-16 bg-white border rounded-md shadow-lg dark:bg-transparent">
                    {users.map((user, index) => (
                        <div
                            key={user.slug}
                            onClick={handleAddOwner(user)}
                            className={`cursor-pointer p-2 hover:bg-primary/30 ${index < users.length - 1 ? 'border-b' : ''
                                }`}
                        >
                            <div className="font-medium">
                                {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {user.phonenumber}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}