import { useEffect, useState, useRef } from 'react'
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
import { Role } from '@/constants'

export default function CustomerSearchInput() {
    const { t } = useTranslation(['menu'])
    const { t: tCommon } = useTranslation(['common'])
    const [users, setUsers] = useState<IUserInfo[]>([])
    const { pagination, setPagination } = usePagination()
    const { inputValue, setInputValue, debouncedInputValue } = useDebouncedInput()
    const { getCartItems, addCustomerInfo, removeCustomerInfo } = useCartItemStore()
    const cartItems = getCartItems()
    const userListRef = useRef<HTMLDivElement>(null)

    const { data: userByPhoneNumber } = useUsers(
        debouncedInputValue
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

    useEffect(() => {
        if (debouncedInputValue === '') {
            setUsers([])
        } else if (userByPhoneNumber?.result?.items) {
            if (pagination.pageIndex === 1) {
                setUsers(userByPhoneNumber.result.items)
            } else {
                setUsers(prev => [...prev, ...userByPhoneNumber.result.items])
            }
        }
    }, [debouncedInputValue, userByPhoneNumber, pagination.pageIndex])

    const handleScroll = () => {
        if (userListRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = userListRef.current
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                setPagination(prev => ({
                    ...prev,
                    pageIndex: prev.pageIndex + 1
                }))
            }
        }
    }

    const handleAddOwner = (user: IUserInfo) => () => {
        addCustomerInfo(user)
        setUsers([])
        setInputValue('')
    }

    const handleRemoveOwner = () => {
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
                {(cartItems?.ownerFullName || cartItems?.ownerPhoneNumber) && (
                    <div className='flex gap-2 justify-between items-center p-2 w-full rounded-md border'>
                        <div className='flex flex-col gap-1 justify-center items-start py-1 text-sm w-fit'>
                            <span className='font-bold text-md'>
                                {cartItems?.ownerFullName}
                            </span>
                            <span className='text-sm text-muted-foreground'>
                                {cartItems?.ownerPhoneNumber}
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
                <div
                    ref={userListRef}
                    onScroll={handleScroll}
                    className="overflow-y-auto absolute z-50 p-2 mt-11 w-full max-h-96 bg-white rounded-md border shadow-lg dark:bg-transparent"
                >
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