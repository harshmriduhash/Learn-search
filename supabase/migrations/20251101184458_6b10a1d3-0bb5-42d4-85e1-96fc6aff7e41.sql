-- Enable vector extension first for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table to store uploaded files
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create embeddings table for semantic search
CREATE TABLE public.document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inverted index table for keyword search
CREATE TABLE public.inverted_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  tf_idf FLOAT NOT NULL,
  term_frequency INTEGER NOT NULL,
  positions INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX idx_inverted_index_term ON public.inverted_index(term);
CREATE INDEX idx_inverted_index_document ON public.inverted_index(document_id);
CREATE INDEX idx_embeddings_document ON public.document_embeddings(document_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS (public access for this demo)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inverted_index ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for demo purposes
CREATE POLICY "Public can view all documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Public can insert documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update documents" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Public can delete documents" ON public.documents FOR DELETE USING (true);

CREATE POLICY "Public can view embeddings" ON public.document_embeddings FOR SELECT USING (true);
CREATE POLICY "Public can insert embeddings" ON public.document_embeddings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete embeddings" ON public.document_embeddings FOR DELETE USING (true);

CREATE POLICY "Public can view index" ON public.inverted_index FOR SELECT USING (true);
CREATE POLICY "Public can insert index" ON public.inverted_index FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete index" ON public.inverted_index FOR DELETE USING (true);