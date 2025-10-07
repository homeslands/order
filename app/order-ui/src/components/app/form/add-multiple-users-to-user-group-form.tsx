import React, { useImperativeHandle, forwardRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'

import {
  Form,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'

import { IUserInfo } from '@/types'
import { useAddMultipleGroupMember } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IFormAddMultipleUsersToUserGroupProps {
  users: IUserInfo[]
  onSubmit: (isOpen: boolean) => void
  onRef?: (ref: { submitForm: () => void }) => void
}

export interface IFormAddMultipleUsersToUserGroupRef {
  submitForm: () => void
}

type TFormData = {
  [key: string]: number
}

export const AddMultipleUsersToUserGroupForm = forwardRef<
  IFormAddMultipleUsersToUserGroupRef,
  IFormAddMultipleUsersToUserGroupProps
>(({ users, onSubmit, onRef }, ref) => {
  const queryClient = useQueryClient()
  const { slug: userGroupSlug } = useParams()
  const { t } = useTranslation(['customer'])
  const { t: tToast } = useTranslation('toast')
  const { mutate: addMultipleUserGroupMember } = useAddMultipleGroupMember()

  const form = useForm<TFormData>({})

  const handleSubmit = useCallback(() => {
    addMultipleUserGroupMember({
      users: users.map((user) => user.slug),
      userGroup: userGroupSlug as string,
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.userGroupMembers],
          exact: false,
          refetchType: 'all'
        })
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.userGroups],
          exact: false,
          refetchType: 'all'
        })
        form.reset()
        showToast(tToast('toast.addMultipleUsersToUserGroupSuccess'))
        onSubmit(false)
      },
    })
  }, [addMultipleUserGroupMember, users, userGroupSlug, queryClient, form, tToast, onSubmit])

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit()
    }
  }), [handleSubmit])

  // Expose ref to parent component
  React.useEffect(() => {
    if (onRef) {
      onRef({
        submitForm: handleSubmit
      })
    }
  }, [onRef, handleSubmit])

  return (
    <div className="mt-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">{t('customer.userGroup.selectedUsers')}</h3>

            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70%]">{t('customer.userGroup.fullName')}</TableHead>
                    <TableHead className="w-[30%]">{t('customer.userGroup.phoneNumber')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.slug}>
                      <TableCell className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </TableCell>
                      <TableCell>
                        {user?.phonenumber}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </form>
      </Form>
    </div>
  )
})

AddMultipleUsersToUserGroupForm.displayName = 'AddMultipleUsersToUserGroupForm'
