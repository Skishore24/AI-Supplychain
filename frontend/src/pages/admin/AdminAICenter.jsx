import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import AIChat from "../../components/ai/AIChat";
import AgentStatus from "../../components/ai/AgentStatus";
import OllamaStatus from "../../components/ai/OllamaStatus";
import RecommendationCard from "../../components/ai/RecommendationCard";
import { useRecommendations } from "../../hooks/useRecommendations";
import { Bot, Sparkles, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminAICenter() {
  const { recommendations, loading: recsLoading, approve, reject, fetchRecommendations } = useRecommendations("GENERATED");

  return (
    <AdminLayout
      title="AI Operations & Multi-Agent Control Center"
      subtitle="Enterprise local intelligence hub powered by Ollama, specialized agents, pgvector RAG, and ML time-series models."
      onRefresh={fetchRecommendations}
      refreshing={recsLoading}
    >
      <div className="space-y-6">
        {/* Top Agent Status Bar */}
        <AgentStatus />

        {/* Ollama Status Overview */}
        <OllamaStatus />

        {/* Main 2-Column Work Area: AI Chat + Recommendations Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive AI Chat Copilot (7 cols) */}
          <div className="lg:col-span-7">
            <AIChat onActionTriggered={fetchRecommendations} />
          </div>

          {/* Right: Pending Human-in-the-Loop Recommendations (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-sm font-black text-slate-900 font-heading flex items-center gap-2">
                  <span>Pending AI Recommendations</span>
                  <span className="rounded-full bg-amber-500 text-white text-[10px] font-black px-2 py-0.5">
                    {recommendations.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actionable procurement recommendations awaiting administrator approval.
                </p>
              </div>

              <Link
                to="/admin/recommendations"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-200 bg-white text-center">
                  <ShieldCheck size={28} className="text-emerald-500 mb-2" />
                  <div className="text-xs font-bold text-slate-800">All Restock Levels Optimal</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    No pending purchase orders required at this time.
                  </div>
                </div>
              ) : (
                recommendations.slice(0, 3).map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onApprove={approve}
                    onReject={reject}
                    loading={recsLoading}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
