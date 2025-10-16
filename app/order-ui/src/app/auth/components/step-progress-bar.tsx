import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepProgressBarProps {
    currentStep: number
    steps: string[]
}

export default function StepProgressBar({ currentStep, steps }: StepProgressBarProps) {
    return (
        <div className="px-4 py-4 w-full">
            <div className="flex relative justify-between items-center mx-auto max-w-2xl">
                {/* Circles */}
                {steps.map((label, index) => {
                    const step = index + 1
                    const isCompleted = step < currentStep
                    const isCurrent = step === currentStep
                    const isLast = index === steps.length - 1

                    return (
                        <div key={label} className="flex relative z-10 flex-col flex-1 items-center">
                            {/* Connector Line */}
                            {!isLast && (
                                <div className="absolute top-[14px] left-[50%] right-0 flex items-center">
                                    <div
                                        className={cn(
                                            'w-full rounded-full transition-all duration-300 h-[3px]',
                                            isCompleted ? 'bg-primary' : 'bg-gray-300'
                                        )}
                                    />
                                </div>
                            )}

                            {/* Circle container */}
                            <div className="flex relative justify-center items-center mb-2">
                                {/* Outer ring for current step */}
                                {isCurrent && (
                                    <div className="absolute w-10 h-10 rounded-full border-[6px] border-primary/20"></div>
                                )}

                                {/* Circle */}
                                <div
                                    className={cn(
                                        'flex relative justify-center items-center w-7 h-7 bg-white rounded-full border-2 transition-all duration-300 ease-in-out',
                                        isCompleted
                                            ? 'bg-primary border-primary'
                                            : isCurrent
                                                ? 'bg-white border-primary'
                                                : 'bg-white border-gray-300'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                    ) : (
                                        <div
                                            className={cn(
                                                'w-3 h-3 rounded-full transition-all',
                                                isCurrent ? 'bg-primary' : 'bg-gray-300'
                                            )}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    'text-xs text-center whitespace-nowrap',
                                    isCompleted
                                        ? 'font-medium text-primary'
                                        : isCurrent
                                            ? 'font-semibold text-primary'
                                            : 'text-gray-400'
                                )}
                            >
                                {label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

