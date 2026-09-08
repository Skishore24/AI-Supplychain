import { useState, useCallback, useEffect } from "react";
import { aiApi } from "../services/aiApi";

export function useRecommendations(initialStatus = null) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRecommendations = useCallback(async (statusFilter = initialStatus) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiApi.recommendations.list(statusFilter);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initialStatus]);

  const approve = useCallback(async (id) => {
    setActionLoading(id);
    try {
      const res = await aiApi.recommendations.approve(id);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "EXECUTED" } : r))
      );
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, []);

  const reject = useCallback(async (id, notes = "") => {
    setActionLoading(id);
    try {
      const res = await aiApi.recommendations.reject(id, notes);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
      );
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    actionLoading,
    error,
    fetchRecommendations,
    approve,
    reject
  };
}
