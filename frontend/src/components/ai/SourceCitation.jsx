import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from "lucide-react";

export default function SourceCitation({ sources = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        <ShieldCheck size={13} className="text-amber-600" />
        <span>Grounded Corporate Citations ({sources.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((src, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={src.chunk_id || idx}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs transition hover:border-amber-300"
            >
              <div
                className="flex items-start justify-between gap-2 cursor-pointer"
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800 shrink-0">
                    <FileText size={12} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">
                      {src.document_name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Page {src.page || 1} {src.section ? `• ${src.section}` : ""}
                    </div>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {isExpanded && src.snippet && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-sans leading-relaxed bg-white p-2 rounded-lg border border-slate-100">
                  "{src.snippet}"
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
