import { Brain, Calculator, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

export const InfoPanel = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">TF-IDF Search</h3>
            <p className="text-sm text-muted-foreground">
              Keyword matching with statistical relevance scoring
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Brain className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Semantic Search</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered understanding using vector embeddings
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-cyber rounded-lg">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Hybrid Ranking</h3>
            <p className="text-sm text-muted-foreground">
              Best of both: combines keyword + semantic scores
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
