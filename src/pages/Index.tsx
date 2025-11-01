import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SearchResult } from "@/components/SearchResult";
import { DocumentUpload } from "@/components/DocumentUpload";
import { InfoPanel } from "@/components/InfoPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "lucide-react";

const Index = () => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("hybrid");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    loadDocCount();
  }, []);

  const loadDocCount = async () => {
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    setDocCount(count || 0);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search', {
        body: { query, searchType },
      });

      if (error) throw error;
      setResults(data.results);
      toast.success(`Found ${data.results.length} results`);
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.message || 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyber mb-4">
            <Database className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-cyber bg-clip-text text-transparent">
            AI Search Engine
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn how search engines work with TF-IDF, vector embeddings, and hybrid ranking
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {docCount} documents indexed
          </p>
        </div>

        <InfoPanel />

        {/* Search Interface */}
        <div className="mb-12">
          <SearchBar
            query={query}
            setQuery={setQuery}
            searchType={searchType}
            setSearchType={setSearchType}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mb-12 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
            {results.map((result) => (
              <SearchResult key={result.id} result={result} searchType={searchType} />
            ))}
          </div>
        )}

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto">
          <DocumentUpload onUploadComplete={loadDocCount} />
        </div>
      </div>
    </div>
  );
};

export default Index;
