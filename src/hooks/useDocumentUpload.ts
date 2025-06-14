
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProjectDocuments = (projectId: string) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("project-docs")
        .list(projectId, { limit: 100, offset: 0 });
      if (error) throw error;
      setFiles(data ?? []);
    } catch {
      setFiles([]);
    }
    setLoading(false);
  };

  return {
    files,
    loading,
    fetchDocuments,
  };
};
