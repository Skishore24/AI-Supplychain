import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useKnowledgeBase } from "../../hooks/useKnowledgeBase";
import { aiApi } from "../../services/aiApi";
import {
  UploadCloud,
  FileText,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink
} from "lucide-react";

export default function AdminKnowledge() {
  const {
    documents,
    loading,
    uploading,
    error,
    uploadDocument,
    deleteDocument,
    reindexDocument,
    fetchDocuments
  } = useKnowledgeBase();

  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState("policy");
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Live search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || uploading) return;
    setUploadSuccess(null);
    try {
      const res = await uploadDocument(selectedFile, docType);
      setUploadSuccess(`Successfully indexed ${res.document?.chunk_count || 0} chunks from ${selectedFile.name}`);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || searching) return;
    setSearching(true);
    try {
      const res = await aiApi.knowledge.search(searchQuery.trim());
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <AdminLayout
      title="Corporate Knowledge Base & pgvector RAG"
      subtitle="Upload, chunk, embed, and search procurement policies, supplier contracts, and warehouse SOPs."
      onRefresh={fetchDocuments}
      refreshing={loading}
    >
      <div className="space-y-6">
        {/* Upload & Search 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload Card (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 font-heading flex items-center gap-2">
              <UploadCloud size={17} className="text-amber-600" />
              <span>Ingest New Document</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports PDF, DOCX, TXT, CSV. Files are automatically extracted, chunked, and embedded into pgvector.
            </p>

            <form onSubmit={handleUpload} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Document Type / Category
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="policy">Procurement & Company Policy</option>
                  <option value="contract">Supplier Agreement / Contract</option>
                  <option value="sop">Warehouse Standard Operating Procedure (SOP)</option>
                  <option value="manual">Product Specification / Manual</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Select Document File
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.csv"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-950 file:text-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 py-2.5 px-4 text-xs font-bold text-white shadow-xs transition disabled:opacity-40 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-amber-400" />
                    <span>Extracting, Chunking & Embedding...</span>
                  </>
                ) : (
                  <>
                    <Database size={14} className="text-amber-400" />
                    <span>Upload & Ingest to RAG</span>
                  </>
                )}
              </button>

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  <span>{uploadSuccess}</span>
                </div>
              )}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </div>

          {/* Live Hybrid Search Tester (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 font-heading flex items-center gap-2">
                <Search size={17} className="text-amber-600" />
                <span>Test Hybrid Knowledge Retrieval</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates vector similarity and lexical matching against indexed chunks.
              </p>

              <form onSubmit={handleSearch} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., What is our emergency purchasing policy?"
                  className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-40 cursor-pointer"
                >
                  {searching ? "Searching..." : "Search RAG"}
                </button>
              </form>

              {searchResults && (
                <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto">
                  <div className="text-xs font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-normal block text-[10px] uppercase font-bold">Grounded Answer:</span>
                    {searchResults.answer}
                  </div>

                  {searchResults.sources && searchResults.sources.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Retrieved Sources:</div>
                      {searchResults.sources.map((s, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                          <span className="font-bold text-slate-900">{s.document_name}</span> (Page {s.page})
                          <div className="text-slate-500 italic mt-0.5 font-mono text-[10px]">
                            "{s.snippet}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!searchResults && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400 border border-slate-100">
                Run a query to inspect real-time hybrid retrieval and citation generation.
              </div>
            )}
          </div>
        </div>

        {/* Indexed Documents Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 font-heading">
              Indexed Documents ({documents.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Document Name</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">File Size</th>
                  <th className="px-5 py-3">Chunks</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                      No corporate documents uploaded yet. Upload a PDF or DOCX above to populate the RAG system.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3 font-bold text-slate-900 flex items-center gap-2">
                        <FileText size={15} className="text-amber-600 shrink-0" />
                        <span className="truncate max-w-xs">{doc.name}</span>
                      </td>
                      <td className="px-5 py-3 capitalize text-slate-600 font-semibold">
                        {doc.document_type}
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-mono">
                        {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : "N/A"}
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-slate-800">
                        {doc.chunk_count}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            doc.status === "INDEXED"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.status === "FAILED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => reindexDocument(doc.id)}
                            title="Re-chunk and Re-embed"
                            className="p-1 text-slate-400 hover:text-amber-600 transition"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            title="Delete document"
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
