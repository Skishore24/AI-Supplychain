import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useAI() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [riskOverview, setRiskOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAIData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, alertData, fcData, riskData] = await Promise.all([
        api.ai.summary(),
        api.ai.restockIntelligence(),
        api.ai.demandForecast(),
        api.ai.riskOverview(),
      ]);
      setSummary(sum);
      setAlerts(alertData.alerts || []);
      setForecast(fcData);
      setRiskOverview(riskData);
    } catch (err) {
      setError(err.message || "Failed to load AI intelligence data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAIData();
  }, [fetchAIData]);

  return {
    summary,
    alerts,
    forecast,
    riskOverview,
    loading,
    error,
    refetch: fetchAIData,
  };
}

export default useAI;
