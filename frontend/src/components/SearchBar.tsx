import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="text"
          placeholder="Enter website URL to check..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 h-12 px-4 text-base bg-background border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        <Button
          type="submit"
          variant="default"
          className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
        >
          Check
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;