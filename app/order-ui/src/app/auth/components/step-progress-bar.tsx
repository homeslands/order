"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepProgressBarProps {
    currentStep: number
    steps: string[]
}

export default function StepProgressBar({ currentStep, steps }: StepProgressBarProps) {
    const getStepStatus = (index: number) => {
        if (index < currentStep - 1) return "completed"
        if (index === currentStep - 1) return "current"
        return "upcoming"
    }

    const getLineStatus = (index: number) => {
        if (index < currentStep - 1) return "completed"
        return "upcoming"
    }

    return (
        <div className="px-4 py-8 mx-auto w-full max-w-2xl">
            <div className="flex relative justify-between items-center">
                {/* Connector lines (placed behind circles) */}
                <div className="absolute top-[20px] left-0 right-0 flex justify-between px-[6%]">
                    {steps.slice(0, -1).map((_, index) => (
                        <div
                            key={`line-${index}`}
                            className={cn(
                                "h-[2px] flex-1 mx-2 rounded-full transition-all duration-300",
                                getLineStatus(index) === "completed" ? "bg-primary" : "bg-muted-foreground/20"
                            )}
                        />
                    ))}
                </div>

                {/* Circles + Labels */}
                {steps.map((step, index) => {
                    const status = getStepStatus(index)
                    return (
                        <div key={index} className="flex relative z-10 flex-col items-center">
                            {/* Circle */}
                            {status === "completed" && (
                                <div className="flex justify-center items-center w-10 h-10 rounded-full border-2 transition-all duration-300 bg-primary border-primary">
                                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                </div>
                            )}

                            {status === "current" && (
                                <div className="flex relative justify-center items-center">
                                    <div className="absolute w-9 h-9 rounded-full border-[6px] border-primary/30"></div>
                                    <div className="flex justify-center items-center w-8 h-8 rounded-full border-2 transition-all duration-300 border-primary bg-background">
                                        <div className="w-3 h-3 rounded-full bg-primary" />
                                    </div>
                                </div>
                            )}

                            {status === "upcoming" && (
                                <div className="flex justify-center items-center w-8 h-8 rounded-full border-2 transition-all duration-300 border-muted-foreground/30 bg-background">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                                </div>
                            )}

                            {/* Label */}
                            <p
                                className={cn(
                                    "mt-2 text-sm text-center transition-colors duration-300",
                                    status === "completed" && "text-primary",
                                    status === "current" && "text-foreground font-semibold",
                                    status === "upcoming" && "text-muted-foreground"
                                )}
                            >
                                {step}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
