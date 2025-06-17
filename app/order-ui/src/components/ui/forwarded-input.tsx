import React from 'react'
import { Input } from './input';

export const ForwardedInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>((props, ref) => {
    return <Input ref={ref} {...props} />;
});
ForwardedInput.displayName = 'ForwardedInput';