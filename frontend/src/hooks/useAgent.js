import { useState, useCallback } from "react";
import { aiApi } from "../services/aiApi";

export function useAgent() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [trace, setTrace] = useState(null);
  const [error, setError] = useState(null);

  const runAgent = useCallback(async (agentName, payload = {}) => {
    setRunning(true);
    setError(null);
    try {
      const data = await aiApi.agents.run(agentName, payload);
      setResult(data);
      if (data._trace) {
        setTrace(data._trace);
      }
      return data;
    } catch (err) {
      setError(err.message || `Agent ${agentName} execution failed.`);
      throw err;
    } finally {
      setRunning(false);
    }
  }, []);

  return {
    running,
    result,
    trace,
    error,
    runAgent,
    reset: () => { setResult(null); setTrace(null); setError(null); }
  };
}
