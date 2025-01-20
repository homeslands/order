import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaticPageSelectProps {
  defaultValue?: string;
  onChange: (value: string) => void;
}

export default function StaticPageSelect({
  defaultValue,
  onChange,
}: StaticPageSelectProps) {
  const staticPages = [
    { value: "ABOUT-US", label: "About Us" },
    { value: "MENU", label: "Menu" },
    { value: "POLICY", label: "Privacy Policy" },
    { value: "CONTACT", label: "Contact Us" },
    { value: "LOCATIONS", label: "Our Locations" },
    { value: "CAREERS", label: "Careers" },
  ];

  const handleChange = (value: string) => {
    onChange(value); // Call the onChange handler with the selected value
  };

  return (
    <Select
      defaultValue={defaultValue} // Set default value if provided
      onValueChange={handleChange} // Handle change event
    >
      <SelectTrigger className="w-[180px] h-10">
        <SelectValue placeholder="Select a page" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Static Pages</SelectLabel>
          {staticPages.map((page) => (
            <SelectItem key={page.value} value={page.value}>
              {page.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
