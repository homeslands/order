import React, { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
    length?: number
    value: string
    onChange: (value: string) => void
    className?: string
    disabled?: boolean
    allowText?: boolean
}

export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
    ({ length = 6, value, onChange, className, disabled = false, allowText = false }, ref) => {
        const inputRefs = useRef<(HTMLInputElement | null)[]>([])
        const [activeIndex, setActiveIndex] = useState(-1)

        useEffect(() => {
            inputRefs.current = inputRefs.current.slice(0, length)
        }, [length])

        useEffect(() => {
            if (!disabled && inputRefs.current[0]) {
                inputRefs.current[0].focus()
                setActiveIndex(0)
            }
        }, [disabled])

        const handleChange = (index: number, inputValue: string) => {
            if (disabled) return

            const newValue = value.split('')

            if (!allowText) {
                inputValue = inputValue.replace(/\D/g, '')
            }

            if (inputValue.length > 1) {
                inputValue = inputValue.slice(-1)
            }

            newValue[index] = inputValue
            const result = newValue.join('').slice(0, length)
            onChange(result)

            if (inputValue && index < length - 1) {
                inputRefs.current[index + 1]?.focus()
                setActiveIndex(index + 1)
            }
        }

        const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (disabled) return

            if (e.key === 'Backspace') {
                e.preventDefault()
                const newValue = value.split('')

                if (newValue[index]) {
                    newValue[index] = ''
                    onChange(newValue.join(''))
                } else if (index > 0) {
                    newValue[index - 1] = ''
                    onChange(newValue.join(''))
                    inputRefs.current[index - 1]?.focus()
                    setActiveIndex(index - 1)
                }
            } else if (e.key === 'ArrowLeft' && index > 0) {
                inputRefs.current[index - 1]?.focus()
                setActiveIndex(index - 1)
            } else if (e.key === 'ArrowRight' && index < length - 1) {
                inputRefs.current[index + 1]?.focus()
                setActiveIndex(index + 1)
            }
        }

        const handleFocus = (index: number) => {
            if (index > 0) {
                const previousValues = value.split('').slice(0, index)
                const hasEmptyPrevious = previousValues.some((val, i) => !val && i < index)

                if (hasEmptyPrevious) {
                    const firstEmptyIndex = previousValues.findIndex((val, i) => !val && i <= index)
                    if (firstEmptyIndex !== -1) {
                        inputRefs.current[firstEmptyIndex]?.focus()
                        setActiveIndex(firstEmptyIndex)
                        return
                    }
                }
            }

            setActiveIndex(index)
        }

        const handleBlur = () => {
            setActiveIndex(-1)
        }

        const handlePaste = (e: React.ClipboardEvent) => {
            if (disabled) return

            e.preventDefault()
            let pastedData = e.clipboardData.getData('text/plain')

            if (!allowText) {
                pastedData = pastedData.replace(/\D/g, '')
            }

            pastedData = pastedData.slice(0, length)
            onChange(pastedData)

            const nextIndex = Math.min(pastedData.length, length - 1)
            inputRefs.current[nextIndex]?.focus()
            setActiveIndex(nextIndex)
        }

        const handleClick = (index: number) => {
            if (disabled) return

            if (index > 0) {
                const previousValues = value.split('').slice(0, index)
                const hasEmptyPrevious = previousValues.some((val, i) => !val && i < index)

                if (hasEmptyPrevious) {
                    const firstEmptyIndex = previousValues.findIndex((val, i) => !val && i <= index)
                    if (firstEmptyIndex !== -1) {
                        inputRefs.current[firstEmptyIndex]?.focus()
                        setActiveIndex(firstEmptyIndex)
                        return
                    }
                }
            }

            inputRefs.current[index]?.focus()
            setActiveIndex(index)
        }

        return (
            <div
                ref={ref}
                className={cn('flex gap-2 justify-center', className)}
                onPaste={handlePaste}
            >
                {Array.from({ length }, (_, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode={allowText ? "text" : "numeric"}
                        pattern={allowText ? undefined : "[0-9]*"}
                        maxLength={1}
                        value={value[index] || ''}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onFocus={() => handleFocus(index)}
                        onBlur={handleBlur}
                        onClick={() => handleClick(index)}
                        disabled={disabled}
                        className={cn(
                            'w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-primary/20',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            'cursor-pointer',
                            activeIndex === index
                                ? 'border-primary bg-primary/5'
                                : value[index]
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 bg-white hover:border-gray-400',
                            'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
                            'dark:hover:border-gray-500 dark:focus:border-primary'
                        )}
                    />
                ))}
            </div>
        )
    }
)

OTPInput.displayName = 'OTPInput' 