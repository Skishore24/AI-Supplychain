import { useState, useCallback, useEffect } from "react";
import { aiApi } from "../services/aiApi";

export function useForecast(productId = null) {
  const [forecast, setForecast] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchForecast = useCallback(async (pId) => {
    const id = pId || productId;
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [fData, aData] = await Promise.all([
        aiApi.forecast.get(id).catch(() => null),
        aiApi.forecast.accuracy(id).catch(() => null)
      ]);
      setForecast(fData);
      setAccuracy(aData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const generateForecast = useCallback(async (pId) => {
    const id = pId || productId;
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.forecast.generate(id);
      if (res.forecast) {
        setForecast(res.forecast);
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchForecast(productId);
    }
  }, [productId, fetchForecast]);

  return {
    forecast,
    accuracy,
    loading,
    error,
    fetchForecast,
    generateForecast
  };
}
