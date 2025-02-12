import { useEffect, useState } from 'react'
import ReactSelect, { SingleValue } from 'react-select'
import { useTranslation } from 'react-i18next'

import { useRole } from '@/hooks'

interface SelectRoleProps {
    defaultValue?: string
    onChange: (value: string) => void
}

export default function RoleSelect({
    defaultValue,
    onChange,
}: SelectRoleProps) {
    const [allRoles, setAllRoles] = useState<{ value: string; label: string }[]>(
        [],
    )
    const [selectedRole, setSelectedRole] = useState<{
        value: string
        label: string
    } | null>(null)
    const { data } = useRole()
    const { t } = useTranslation('role')

    // Effect to append new users to the local state when users are fetched
    useEffect(() => {
        if (data?.result) {
            const newRoles = data.result.map((item) => ({
                value: item.slug || '',
                label: t(`role.${item.name}`) || item.name || '',
            }))
            // Append new users to the previous users
            setAllRoles(newRoles)
        }
    }, [data, t])

    // Set default value when it's available
    useEffect(() => {
        if (defaultValue && allRoles.length > 0) {
            const defaultOption = allRoles.find((role) => role.value === defaultValue)
            if (defaultOption) {
                setSelectedRole(defaultOption)
            }
        }
    }, [defaultValue, allRoles])

    const handleChange = (
        selectedOption: SingleValue<{ value: string; label: string }>,
    ) => {
        if (selectedOption) {
            setSelectedRole(selectedOption)
            onChange(selectedOption.value) // Only pass the value (slug)
        }
    }

    return (
        <ReactSelect
            value={selectedRole}
            onMenuScrollToBottom={() => { }}
            options={allRoles}
            onChange={handleChange}
            defaultValue={selectedRole}
        />
    )
}
