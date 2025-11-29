import { Search, Loader2 } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  isLoading = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
      {isLoading ? (
        <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
      ) : (
        <Search className="w-5 h-5 text-gray-500" />
      )}

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search events..."
        className="flex-1 bg-transparent outline-none text-sm"
      />
    </div>
  );
}
