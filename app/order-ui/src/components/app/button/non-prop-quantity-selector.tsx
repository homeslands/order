import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui';

interface NonPropQuantitySelectorProps {
    currentQuantity: number; // Giá trị tối đa
    disabled: boolean
    isLimit: boolean; // Có giới hạn không
    onChange?: (quantity: number) => void; // Callback khi giá trị thay đổi
}

export default function NonPropQuantitySelector({ currentQuantity, isLimit, disabled, onChange }: NonPropQuantitySelectorProps) {
    const [quantity, setQuantity] = useState(1);

    const handleIncrement = () => {
        setQuantity((prev) => {
            const newQuantity = isLimit ? Math.min(prev + 1, currentQuantity) : prev + 1; // Chỉ giới hạn khi isLimit = true
            onChange?.(newQuantity);
            return newQuantity;
        });
    };

    const handleDecrement = () => {
        setQuantity((prev) => {
            const newQuantity = Math.max(prev - 1, 1); // Giá trị nhỏ nhất là 1
            onChange?.(newQuantity);
            return newQuantity;
        });
    };

    return (
        <div className="flex items-center gap-1.5">
            <Button
                disabled={disabled}
                variant="ghost"
                size="icon"
                onClick={handleDecrement}
                className="p-1 border rounded-full h-fit w-fit hover:bg-gray-100"
            >
                <Minus size={12} />
            </Button>
            <span className="w-4 text-xs text-center">{quantity}</span>
            <Button
                disabled={disabled || (isLimit && quantity >= currentQuantity)}
                variant="ghost"
                size="icon"
                onClick={handleIncrement}
                className="p-1 border rounded-full h-fit w-fit hover:bg-gray-100"
            >
                <Plus size={12} />
            </Button>
        </div>
    );
}
