import React, { useRef } from "react";

interface IpAddressInputProps {
    value?: string;
    onChange?: (value: string) => void;
}

export default function IpAddressInput({ value = "", onChange }: IpAddressInputProps) {
    const octets = value.split(".").concat(["", "", "", ""]).slice(0, 4);
    const inputsRef = useRef<HTMLInputElement[]>([]);

    const handleChange = (index: number, val: string) => {
        const num = val.replace(/\D/g, ""); // chỉ cho số
        if (num.length > 3) return;

        const newOctets = [...octets];
        newOctets[index] = num;

        // Nếu nhập đủ 3 số hoặc >= 100 thì chuyển focus sang ô kế tiếp
        if (num.length === 3 || parseInt(num) > 99) {
            if (index < 3) inputsRef.current[index + 1]?.focus();
        }

        onChange?.(newOctets.join("."));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !octets[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex gap-2">
            {octets.map((octet, index) => (
                <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={3}
                    value={octet}
                    ref={(el) => (inputsRef.current[index] = el!)}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="px-2 py-1 text-center border rounded w-14 focus:outline-none"
                />
            ))}
        </div>
    );
}
