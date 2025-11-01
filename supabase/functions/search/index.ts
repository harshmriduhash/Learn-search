import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, searchType = 'hybrid' } = await req.json();
    console.log('Search query:', query, 'Type:', searchType);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    let keywordResults: any[] = [];
    let semanticResults: any[] = [];

    // Keyword search (TF-IDF)
    if (searchType === 'keyword' || searchType === 'hybrid') {
      console.log('Performing keyword search...');
      const queryTokens = tokenize(query);
      
      if (queryTokens.length > 0) {
        const { data: indexData } = await supabase
          .from('inverted_index')
          .select('document_id, term, tf_idf')
          .in('term', queryTokens);

        // Aggregate scores per document
        const docScores: Record<string, number> = {};
        if (indexData) {
          for (const entry of indexData) {
            docScores[entry.document_id] = (docScores[entry.document_id] || 0) + entry.tf_idf;
          }
        }

        // Get top documents
        const topDocIds = Object.entries(docScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([id]) => id);

        if (topDocIds.length > 0) {
          const { data: docs } = await supabase
            .from('documents')
            .select('*')
            .in('id', topDocIds);

          keywordResults = (docs || []).map(doc => ({
            ...doc,
            keywordScore: docScores[doc.id],
            semanticScore: 0,
          }));
        }
      }
    }

    // Semantic search (Vector similarity)
    if (searchType === 'semantic' || searchType === 'hybrid') {
      console.log('Performing semantic search...');
      
      // Generate embedding for query
      const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: query,
        }),
      });

      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding;

        // Find similar documents using cosine similarity
        const { data: embeddings } = await supabase
          .from('document_embeddings')
          .select('document_id, embedding')
          .limit(100);

        if (embeddings) {
          const similarities = embeddings.map(emb => ({
            document_id: emb.document_id,
            similarity: cosineSimilarity(queryEmbedding, emb.embedding),
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 10);

          const docIds = similarities.map(s => s.document_id);
          const { data: docs } = await supabase
            .from('documents')
            .select('*')
            .in('id', docIds);

          semanticResults = (docs || []).map(doc => {
            const sim = similarities.find(s => s.document_id === doc.id);
            return {
              ...doc,
              keywordScore: 0,
              semanticScore: sim?.similarity || 0,
            };
          });
        }
      }
    }

    // Combine results for hybrid search
    let finalResults = [];
    if (searchType === 'hybrid') {
      console.log('Combining hybrid results...');
      const allDocIds = new Set([
        ...keywordResults.map(r => r.id),
        ...semanticResults.map(r => r.id),
      ]);

      finalResults = Array.from(allDocIds).map(docId => {
        const keyword = keywordResults.find(r => r.id === docId);
        const semantic = semanticResults.find(r => r.id === docId);
        
        const keywordScore = keyword?.keywordScore || 0;
        const semanticScore = semantic?.semanticScore || 0;
        
        // Hybrid score: weighted combination
        const hybridScore = (keywordScore * 0.4) + (semanticScore * 0.6);

        return {
          ...(keyword || semantic),
          keywordScore,
          semanticScore,
          hybridScore,
        };
      })
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, 10);

    } else if (searchType === 'keyword') {
      finalResults = keywordResults.sort((a, b) => b.keywordScore - a.keywordScore);
    } else {
      finalResults = semanticResults.sort((a, b) => b.semanticScore - a.semanticScore);
    }

    console.log('Returning', finalResults.length, 'results');
    return new Response(
      JSON.stringify({ results: finalResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Search error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
