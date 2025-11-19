interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  label,
  type = "text",
  placeholder,
  className = "",
  value,
  onChange,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary ${className}`}
      />
    </div>
  );
}
