import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  searchType: string;
  setSearchType: (type: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchBar = ({
  query,
  setQuery,
  searchType,
  setSearchType,
  onSearch,
  isLoading
}: SearchBarProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="Search documents..."
          className="pl-12 h-14 text-lg bg-card border-border focus-visible:ring-primary"
        />
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={searchType} onValueChange={setSearchType} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="keyword">Keyword (TF-IDF)</TabsTrigger>
            <TabsTrigger value="semantic">Semantic (AI)</TabsTrigger>
            <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button
          onClick={onSearch}
          disabled={isLoading || !query}
          className="ml-4 px-8"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </div>
  );
};
