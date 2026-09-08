import React, { useState } from "react";
import { CheckCircle2, XCircle, Clock, ArrowRight, ShieldCheck, ShoppingCart, Sparkles } from "lucide-react";

export default function RecommendationCard({ recommendation, onApprove, onReject, loading = false }) {
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!recommendation) return null;

  const status = recommendation.status || "GENERATED";
  const supData = recommendation.supporting_data || {};

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-300 transition">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800 text-[11px] font-black">
              AI
            </span>
            <h4 className="text-sm font-black text-slate-900 font-heading">
              {recommendation.agent_name || "Procurement Recommendation"}
            </h4>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                status === "EXECUTED" || status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : status === "REJECTED"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {recommendation.created_at ? new Date(recommendation.created_at).toLocaleString() : "Just now"}
          </p>
        </div>

        {/* Confidence & Risk Badges */}
        <div className="flex items-center gap-2 shrink-0">
          {recommendation.confidence !== null && recommendation.confidence !== undefined && (
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Confidence</div>
              <div className="text-xs font-black text-emerald-600 font-mono">
                {Math.round(recommendation.confidence * 100)}%
              </div>
            </div>
          )}
          {recommendation.risk_score !== null && recommendation.risk_score !== undefined && (
            <div className="text-right border-l border-slate-200 pl-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Risk Score</div>
              <div className="text-xs font-black text-rose-600 font-mono">
                {recommendation.risk_score}/100
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm font-bold text-slate-800 leading-relaxed">
          {recommendation.recommendation}
        </p>
        {recommendation.reasoning && (
          <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans">
            {recommendation.reasoning}
          </p>
        )}
      </div>

      {/* Supporting Data Grid */}
      {supData && Object.keys(supData).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
          {supData.product_name && (
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block">PRODUCT</span>
              <span className="font-bold text-slate-800 truncate block">{supData.product_name}</span>
            </div>
          )}
          {supData.order_quantity && (
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block">ORDER QTY</span>
              <span className="font-mono font-bold text-slate-900">{supData.order_quantity} units</span>
            </div>
          )}
          {supData.supplier_name && (
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block">SUPPLIER</span>
              <span className="font-bold text-slate-800 truncate block">{supData.supplier_name}</span>
            </div>
          )}
          {supData.total_cost && (
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block">PROJECTED COST</span>
              <span className="font-mono font-bold text-emerald-700">₹{Number(supData.total_cost).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Controls */}
      {status === "GENERATED" && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-rose-700 transition cursor-pointer disabled:opacity-50"
          >
            <XCircle size={14} />
            <span>Reject</span>
          </button>
          <button
            onClick={() => onApprove && onApprove(recommendation.id)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Approve & Create PO</span>
          </button>
        </div>
      )}

      {/* Rejection Prompt Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h4 className="text-sm font-black text-slate-900 font-heading">
              Reject Recommendation #{recommendation.id}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Provide feedback or context for rejecting this automated recommendation.
            </p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g., Supplier quote too high; target buffer reduced to 15 days."
              rows={3}
              className="mt-3 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-amber-500 focus:outline-hidden"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  onReject && onReject(recommendation.id, rejectNotes);
                }}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
