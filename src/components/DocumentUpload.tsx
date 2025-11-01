import { useState } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

export const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!title || !content) {
      toast.error("Please provide both title and content");
      return;
    }

    setIsUploading(true);
    try {
      // Insert document
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({ title, content, file_type: 'text' })
        .select()
        .single();

      if (docError) throw docError;

      // Index document
      const { data: functionData, error: functionError } = await supabase.functions.invoke('index-document', {
        body: {
          documentId: doc.id,
          title: doc.title,
          content: doc.content,
        },
      });

      if (functionError) throw functionError;

      toast.success(`Document indexed! ${functionData.termsIndexed} terms processed`);
      setTitle("");
      setContent("");
      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Upload Document</h2>
      </div>
      
      <Input
        placeholder="Document title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-background"
      />
      
      <Textarea
        placeholder="Document content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[200px] bg-background"
      />
      
      <Button
        onClick={handleUpload}
        disabled={isUploading || !title || !content}
        className="w-full"
      >
        {isUploading ? 'Indexing...' : 'Upload & Index'}
      </Button>
    </Card>
  );
};
