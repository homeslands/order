import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useRoles } from "@/hooks";

interface SelectRoleProps {
    defaultValue?: string;
    onChange: (value: string) => void;
}

export default function RoleSelect({ defaultValue, onChange }: SelectRoleProps) {
    const { t } = useTranslation("role");
    const [allRoles, setAllRoles] = useState<{ value: string; label: string }[]>([]);
    const { data } = useRoles();

    useEffect(() => {
        if (data?.result) {
            const newRoles = data.result.map((item) => ({
                value: item.slug || "",
                label: t(`role.${item.name}`) || item.name || "",
            }));
            setAllRoles(newRoles);
        }
    }, [data, t]);

    return (
        <Select onValueChange={onChange} defaultValue={defaultValue}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Vai trò</SelectLabel>
                    {allRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                            {role.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
