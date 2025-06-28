// import * as React from 'react';
// import * as SliderPrimitive from '@radix-ui/react-slider';

// import { cn } from '@/lib/utils';

// const Slider = React.forwardRef<
//     React.ElementRef<typeof SliderPrimitive.Root>,
//     React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
// >(({ className, ...props }, ref) => (
//     <SliderPrimitive.Root
//         ref={ref}
//         className={cn('relative flex w-full touch-none select-none items-center', className)}
//         {...props}
//     >
//         <SliderPrimitive.Track className="relative w-full h-2 overflow-hidden rounded-full grow bg-secondary">
//             <SliderPrimitive.Range className="absolute h-full bg-primary" />
//         </SliderPrimitive.Track>
//         <SliderPrimitive.Thumb className="block w-5 h-5 transition-colors border-2 rounded-full border-primary bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
//         <SliderPrimitive.Thumb className="block w-5 h-5 transition-colors border-2 rounded-full border-primary bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
//     </SliderPrimitive.Root>
// ));
// Slider.displayName = SliderPrimitive.Root.displayName;

// export { Slider };

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

interface DualRangeSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
    labelPosition?: 'top' | 'bottom';
    label?: (value: number | undefined) => React.ReactNode;
    showInputs?: boolean;
    onValueChange?: (value: number[]) => void;
    formatValue?: (value: number) => string;
    hideMinMaxLabels?: boolean;
}

const DualRangeSlider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    DualRangeSliderProps
>(({
    className,
    label,
    labelPosition = 'top',
    // showInputs = false,
    onValueChange,
    // formatValue = (value) => value.toString(),
    // hideMinMaxLabels = false,
    ...props
}, ref) => {
    const [internalValue, setInternalValue] = React.useState<number[]>(
        Array.isArray(props.value) ? props.value : [props.min || 0, props.max || 100]
    );

    const currentValue = props.value ?
        (Array.isArray(props.value) ? props.value : [props.min || 0, props.max || 100]) :
        internalValue;

    const handleValueChange = (newValue: number[]) => {
        setInternalValue(newValue);
        onValueChange?.(newValue);
    };

    // const handleInputChange = (index: number, inputValue: string) => {
    //     const numValue = parseFloat(inputValue);
    //     if (!isNaN(numValue)) {
    //         const newValue = [...currentValue];
    //         newValue[index] = Math.max(props.min || 0, Math.min(props.max || 100, numValue));
    //         handleValueChange(newValue);
    //     }
    // };

    return (
        <div className="w-full space-y-4">
            {/* {showInputs && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Min:</label>
                        <input
                            type="number"
                            value={currentValue[0]}
                            onChange={(e) => handleInputChange(0, e.target.value)}
                            min={props.min}
                            max={props.max}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Max:</label>
                        <input
                            type="number"
                            value={currentValue[1]}
                            onChange={(e) => handleInputChange(1, e.target.value)}
                            min={props.min}
                            max={props.max}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>
            )} */}
            {/* 
            {!hideMinMaxLabels && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatValue(props.min || 0)}</span>
                    <span>{formatValue(props.max || 100)}</span>
                </div>
            )} */}

            <SliderPrimitive.Root
                ref={ref}
                className={cn('relative flex w-full touch-none select-none items-center', className)}
                value={currentValue}
                onValueChange={handleValueChange}
                {...props}
            >
                <SliderPrimitive.Track className="relative w-full h-2 overflow-hidden rounded-full grow bg-secondary">
                    <SliderPrimitive.Range className="absolute h-full bg-primary" />
                </SliderPrimitive.Track>
                {currentValue.map((value, index) => (
                    <React.Fragment key={index}>
                        <SliderPrimitive.Thumb className="relative block w-4 h-4 transition-colors border-2 rounded-full border-primary bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                            {/* Always show value labels on top of thumbs */}
                            {/* <span
                                className={cn(
                                    'absolute flex w-full justify-center text-xs font-medium text-gray-700 bg-white px-1 py-0.5 rounded border shadow-sm whitespace-nowrap',
                                    labelPosition === 'top' && '-top-8',
                                    labelPosition === 'bottom' && 'top-6',
                                )}
                            >
                                {formatValue(value)}
                            </span> */}
                            {/* Custom label if provided */}
                            {label && (
                                <span
                                    className={cn(
                                        'absolute flex w-full justify-center',
                                        labelPosition === 'top' && '-top-12',
                                        labelPosition === 'bottom' && 'top-10',
                                    )}
                                >
                                    {label(value)}
                                </span>
                            )}
                        </SliderPrimitive.Thumb>
                    </React.Fragment>
                ))}
            </SliderPrimitive.Root>
        </div>
    );
});
DualRangeSlider.displayName = 'DualRangeSlider';

export { DualRangeSlider };

