import { useState, useCallback, useEffect } from "react";
import { aiApi } from "../services/aiApi";

export function useKnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiApi.knowledge.list();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file, documentType = "policy") => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", documentType);
      const res = await aiApi.knowledge.upload(formData);
      await fetchDocuments();
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (id) => {
    try {
      await aiApi.knowledge.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const reindexDocument = useCallback(async (id) => {
    try {
      const res = await aiApi.knowledge.reindex(id);
      await fetchDocuments();
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchDocuments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    uploading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    reindexDocument
  };
}
