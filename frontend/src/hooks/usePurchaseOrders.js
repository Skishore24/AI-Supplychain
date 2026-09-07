import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function usePurchaseOrders(initialFilters = {}) {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchPOs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.purchaseOrders.list(filters);
      setPurchaseOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load purchase orders");
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  return {
    purchaseOrders,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchPOs,
  };
}

export default usePurchaseOrders;
