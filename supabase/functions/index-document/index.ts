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
    const { documentId, title, content } = await req.json();
    console.log('Indexing document:', documentId, title);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Generate embedding for semantic search
    console.log('Generating embedding...');
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: content,
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text();
      console.error('Embedding API error:', error);
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    console.log('Embedding generated, dimension:', embedding.length);

    // Store embedding
    const { error: embeddingError } = await supabase
      .from('document_embeddings')
      .insert({ document_id: documentId, embedding });

    if (embeddingError) {
      console.error('Error storing embedding:', embeddingError);
      throw embeddingError;
    }

    // Step 2: Build inverted index with TF-IDF
    console.log('Building inverted index...');
    const tokens = tokenize(content);
    const termFrequencies = calculateTermFrequency(tokens);

    // Get total document count for IDF calculation
    const { count: totalDocs } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    // Calculate TF-IDF for each term
    const indexEntries = [];
    for (const [term, tf] of Object.entries(termFrequencies)) {
      // Get document frequency (how many docs contain this term)
      const { count: df } = await supabase
        .from('inverted_index')
        .select('document_id', { count: 'exact', head: true })
        .eq('term', term);

      const idf = Math.log((totalDocs || 1) / ((df || 0) + 1));
      const tfIdf = tf * idf;

      // Find positions of term in document
      const positions: number[] = [];
      tokens.forEach((token, index) => {
        if (token === term) positions.push(index);
      });

      indexEntries.push({
        term,
        document_id: documentId,
        tf_idf: tfIdf,
        term_frequency: tf,
        positions,
      });
    }

    console.log('Storing', indexEntries.length, 'index entries...');
    const { error: indexError } = await supabase
      .from('inverted_index')
      .insert(indexEntries);

    if (indexError) {
      console.error('Error storing index:', indexError);
      throw indexError;
    }

    console.log('Document indexed successfully!');
    return new Response(
      JSON.stringify({ success: true, termsIndexed: indexEntries.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error indexing document:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Tokenization function
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

// Calculate term frequency
function calculateTermFrequency(tokens: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  const total = tokens.length;
  
  for (const token of tokens) {
    freq[token] = (freq[token] || 0) + 1;
  }
  
  // Normalize by document length
  for (const term in freq) {
    freq[term] = freq[term] / total;
  }
  
  return freq;
}
