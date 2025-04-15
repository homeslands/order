import { useEffect, useState } from 'react'
import { CircleX, User2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCartItemStore } from '@/stores'
import { IUserInfo } from '@/types'
import { useDebouncedInput, usePagination, useUsers } from '@/hooks'
import {
    Button, Input, Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui'

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
        <div className='flex relative flex-col gap-3'>
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
                    <div className='flex gap-2 justify-between items-center p-2 w-full rounded-md border'>
                        <div className='flex flex-col gap-1 justify-center items-start py-1 text-sm w-fit'>
                            <span className='font-bold text-md'>
                                {selectedUser.firstName} {selectedUser.lastName}
                            </span>
                            <span className='text-sm text-muted-foreground'>
                                {selectedUser.phonenumber}
                            </span>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" onClick={() => handleRemoveOwner()}>
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
                <div className="overflow-y-auto absolute z-50 p-2 mt-11 w-full max-h-96 bg-white rounded-md border shadow-lg dark:bg-transparent">
                    {users.map((user, index) => (
                        <div
                            key={user.slug}
                            onClick={handleAddOwner(user)}
                            className={`flex gap-2 items-center cursor-pointer p-2 rounded-md transition-all duration-300 hover:bg-primary/20 ${index < users.length - 1 ? 'border-b' : ''}`}
                        >
                            <div className='flex justify-center items-center p-2 rounded-full bg-primary/10'>
                                <User2Icon className='w-4 h-4 text-primary' />
                            </div>
                            <div className='flex flex-col'>
                                <div className="font-bold text-muted-foreground">
                                    {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
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