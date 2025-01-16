import { useState } from 'react'
import { useDebounce } from 'use-debounce'

export interface IDebouncedInputProps {
  defaultValue?: string
  delay?: number
}

export function useDebouncedInput({
  defaultValue = '',
  delay = 500,
}: IDebouncedInputProps = {}) {
  const [inputValue, setInputValue] = useState<string>(defaultValue)
  const [debouncedInputValue] = useDebounce(inputValue, delay)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), delay)
  }

  return {
    inputValue,
    setInputValue: handleInputChange,
    debouncedInputValue,
    isLoading,
  }
}
