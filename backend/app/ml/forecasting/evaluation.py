import numpy as np
from typing import Dict, Any

def calculate_forecast_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes standard enterprise forecasting metrics: MAE, RMSE, and MAPE.
    Safely handles zero sales values with epsilon smoothing.
    """
    y_t = np.array(y_true, dtype=float)
    y_p = np.array(y_pred, dtype=float)

    if len(y_t) == 0:
        return {"mae": 0.0, "rmse": 0.0, "mape": 0.0}

    # MAE
    mae = float(np.mean(np.abs(y_t - y_p)))

    # RMSE
    rmse = float(np.sqrt(np.mean((y_t - y_p) ** 2)))

    # MAPE with epsilon protection
    epsilon = 1e-5
    mape = float(np.mean(np.abs((y_t - y_p) / np.maximum(y_t, 1.0))) * 100.0)

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2)
    }
