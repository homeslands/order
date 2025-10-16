import { cn } from '@/lib/utils'

interface StepProgressBarProps {
    currentStep: number
    steps: string[]
}

export default function StepProgressBar({ currentStep, steps }: StepProgressBarProps) {
    return (
        <div className="flex items-center justify-between w-full mb-8 px-2">
            {steps.map((label, index) => {
                const step = index + 1
                const isCompleted = step < currentStep
                const isCurrent = step === currentStep
                // const isUpcoming = step > currentStep

                return (
                    <div key={label} className="flex flex-col items-center w-full relative">
                        {/* --- Circle container --- */}
                        <div className="relative flex items-center justify-center mb-2">
                            {/* Outer ring cho current step */}
                            {isCurrent && (
                                <div className="absolute w-9 h-9 rounded-full border-8 border-primary/30"></div>
                            )}

                            {/* Donut circle */}
                            <div
                                className={cn(
                                    'relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 ease-in-out',
                                    isCompleted
                                        ? 'bg-primary border-primary'
                                        : isCurrent
                                            ? 'border-primary bg-transparent'
                                            : 'border-gray-300 bg-transparent'
                                )}
                            >
                                {/* Inner center */}
                                <div
                                    className={cn(
                                        'w-3 h-3 rounded-full transition-all',
                                        isCompleted
                                            ? 'bg-white'
                                            : isCurrent
                                                ? 'bg-primary'
                                                : 'bg-gray-200'
                                    )}
                                ></div>
                            </div>
                        </div>

                        {/* Label */}
                        <span
                            className={cn(
                                'text-xs text-center whitespace-nowrap',
                                isCompleted
                                    ? 'text-primary font-medium'
                                    : isCurrent
                                        ? 'text-primary font-semibold'
                                        : 'text-gray-400'
                            )}
                        >
                            {label}
                        </span>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'absolute top-[15px] left-1/2 h-[2px] z-0 rounded-full',
                                    isCompleted ? 'bg-primary' : 'bg-gray-300'
                                )}
                                style={{ width: 'calc(100% - 48px)', marginLeft: '24px' }}
                            ></div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
