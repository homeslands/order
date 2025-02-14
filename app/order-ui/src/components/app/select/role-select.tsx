import { useEffect, useState } from 'react'
import ReactSelect, { SingleValue } from 'react-select'
import { useTranslation } from 'react-i18next'

import { useRole } from '@/hooks'
import { useThemeStore } from '@/stores'

interface SelectRoleProps {
    defaultValue?: string
    onChange: (value: string) => void
}

export default function RoleSelect({
    defaultValue,
    onChange,
}: SelectRoleProps) {
    const { getTheme } = useThemeStore()
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
            styles={{
                control: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: getTheme() === 'light' ? 'white' : '',
                    borderColor: getTheme() === 'light' ? '#e2e8f0' : '#2d2d2d',
                }),
                menu: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: getTheme() === 'light' ? 'white' : '#121212',
                }),
                option: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: state.isFocused
                        ? getTheme() === 'light'
                            ? '#e2e8f0'
                            : '#2d2d2d'
                        : getTheme() === 'light'
                            ? 'white'
                            : '#121212',
                    color: getTheme() === 'light' ? 'black' : 'white',
                    '&:hover': {
                        backgroundColor: getTheme() === 'light' ? '#e2e8f0' : '#2d2d2d',
                    },
                }),
                singleValue: (baseStyles) => ({
                    ...baseStyles,
                    color: getTheme() === 'light' ? 'black' : 'white',
                }),
            }}
        />
    )
}
