// Currency and Rupee (INR / ₹) Formatting Utilities

export const USD_TO_INR_RATE = 83;

/**
 * Converts a USD amount to INR.
 * @param {number} usd
 * @returns {number}
 */
export function toINR(usd) {
  const val = Number(usd) || 0;
  return Math.round(val * USD_TO_INR_RATE);
}

/**
 * Formats a number in Indian Rupees with proper Indian numbering system (e.g. ₹1,49,999).
 * @param {number} inr
 * @param {boolean} includeDecimals
 * @returns {string}
 */
export function formatINR(inr, includeDecimals = false) {
  const val = Number(inr) || 0;
  if (includeDecimals) {
    return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

/**
 * Formats a USD amount directly into an Indian Rupee string.
 * @param {number} usd
 * @returns {string}
 */
export function formatUSDToINR(usd) {
  return formatINR(toINR(usd));
}

/**
 * Returns an object with both INR and USD formatted strings for flexible display.
 * @param {number} usd
 */
export function getDualPrice(usd) {
  const usdNum = Number(usd) || 0;
  const inrNum = toINR(usdNum);
  return {
    inr: inrNum,
    inrFormatted: formatINR(inrNum),
    usd: usdNum,
    usdFormatted: `$${usdNum.toFixed(2)}`
  };
}
