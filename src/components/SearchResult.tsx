import { FileText, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SearchResultProps {
  result: {
    id: string;
    title: string;
    content: string;
    keywordScore?: number;
    semanticScore?: number;
    hybridScore?: number;
  };
  searchType: string;
}

export const SearchResult = ({ result, searchType }: SearchResultProps) => {
  const getScore = () => {
    if (searchType === 'keyword') return result.keywordScore || 0;
    if (searchType === 'semantic') return result.semanticScore || 0;
    return result.hybridScore || 0;
  };

  const score = getScore();
  const normalizedScore = Math.min(100, score * 100);

  return (
    <Card className="p-6 hover:border-primary transition-all duration-300 hover:shadow-glow group">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {result.title}
            </h3>
            <Badge variant="outline" className="ml-2">
              Score: {score.toFixed(3)}
            </Badge>
          </div>

          <p className="text-muted-foreground line-clamp-2">
            {result.content.substring(0, 200)}...
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Relevance Score</span>
            </div>
            <Progress value={normalizedScore} className="h-2" />
            
            {searchType === 'hybrid' && (
              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Keyword (TF-IDF)</span>
                    <span className="font-mono text-primary">{(result.keywordScore || 0).toFixed(3)}</span>
                  </div>
                  <Progress value={(result.keywordScore || 0) * 100} className="h-1" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semantic (AI)</span>
                    <span className="font-mono text-accent">{(result.semanticScore || 0).toFixed(3)}</span>
                  </div>
                  <Progress value={(result.semanticScore || 0) * 100} className="h-1" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
