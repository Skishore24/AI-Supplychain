import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useSuppliers(initialFilters = {}) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.suppliers.list(filters);
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load suppliers");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchSuppliers,
  };
}

export default useSuppliers;
