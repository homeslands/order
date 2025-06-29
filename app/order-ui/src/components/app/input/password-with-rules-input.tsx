import { useEffect, useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { Input, Button } from '@/components/ui'
import { AuthRules } from '@/constants'

interface PasswordWithRulesProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
}

export default function PasswordWithRulesInput({
    value,
    onChange,
    placeholder,
    disabled,
}: PasswordWithRulesProps) {
    const { t } = useTranslation('auth')

    const [showPassword, setShowPassword] = useState(false)
    const [touched, setTouched] = useState(false)

    const [rules, setRules] = useState({
        minLength: false,
        maxLength: false,
        hasLetter: false,
        hasNumber: false,
    })

    const hasInput = value.length > 0

    useEffect(() => {
        if (!hasInput) {
            setRules({
                minLength: false,
                maxLength: false,
                hasLetter: false,
                hasNumber: false,
            })
            return
        }

        setRules({
            minLength: value.length >= AuthRules.MIN_LENGTH,
            maxLength: value.length <= AuthRules.MAX_LENGTH,
            hasLetter: /[A-Za-z]/.test(value),
            hasNumber: /\d/.test(value),
        })
    }, [value, hasInput])

    // Optionally evaluate strength (basic)
    const strength = (() => {
        const passed = Object.values(rules).filter(Boolean).length
        if (!hasInput) return null
        if (passed <= 1) return t('rule.weak')
        if (passed === 2 || passed === 3) return t('rule.medium')
        return t('rule.strong')
    })()

    return (
        <div className="space-y-2">
            <div className="relative">
                <Input
                    type={showPassword ? 'text' : 'password'}
                    className={cn('hide-password-toggle pr-10')}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value)
                        if (!touched) setTouched(true)
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={disabled}
                >
                    {showPassword && !disabled ? (
                        <EyeIcon className="w-4 h-4" />
                    ) : (
                        <EyeOffIcon className="w-4 h-4" />
                    )}
                    <span className="sr-only">
                        {showPassword ? t('register.hidePassword') : t('register.showPassword')}
                    </span>
                </Button>

                <style>{`
          .hide-password-toggle::-ms-reveal,
          .hide-password-toggle::-ms-clear {
            display: none;
            pointer-events: none;
            visibility: hidden;
          }
        `}</style>
            </div>

            {touched && (
                <div className="space-y-1 text-sm">
                    <ul className="space-y-1">
                        <li className={cn(rules.minLength ? 'text-green-600' : 'text-muted-foreground')}>
                            • {t('rule.minLength', { count: AuthRules.MIN_LENGTH })}
                        </li>
                        <li className={cn(rules.maxLength ? 'text-green-600' : 'text-muted-foreground')}>
                            • {t('rule.maxLength', { count: AuthRules.MAX_LENGTH })}
                        </li>
                        <li className={cn(rules.hasLetter ? 'text-green-600' : 'text-muted-foreground')}>
                            • {t('rule.hasLetter')}
                        </li>
                        <li className={cn(rules.hasNumber ? 'text-green-600' : 'text-muted-foreground')}>
                            • {t('rule.hasNumber')}
                        </li>
                    </ul>

                    {strength && (
                        <div className={cn(
                            'text-xs font-medium mt-1',
                            strength === t('rule.weak') && 'text-red-600',
                            strength === t('rule.medium') && 'text-yellow-600',
                            strength === t('rule.strong') && 'text-green-600'
                        )}>
                            {t('rule.strength')}: {strength}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
