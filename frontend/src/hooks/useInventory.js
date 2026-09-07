import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useInventory(initialFilters = {}) {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, sum] = await Promise.all([
        api.inventory.detailed(filters),
        api.inventory.summary(),
      ]);
      setInventory(Array.isArray(items) ? items : []);
      setSummary(sum);
    } catch (err) {
      setError(err.message || "Failed to load inventory");
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    summary,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchInventory,
  };
}

export default useInventory;
