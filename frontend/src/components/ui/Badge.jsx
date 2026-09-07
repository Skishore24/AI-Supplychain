import React from "react";

export function Badge({ children, variant = "default", size = "sm", className = "" }) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-amber-50 text-amber-800 border-amber-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-300",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    dark: "bg-slate-900 text-slate-100 border-slate-800",

    // Semantic Status Mappings
    healthy: "bg-emerald-50 text-emerald-800 border-emerald-200",
    low: "bg-amber-50 text-amber-800 border-amber-300",
    critical: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse",
    out_of_stock: "bg-rose-100 text-rose-800 border-rose-300 font-black",
    overstock: "bg-blue-50 text-blue-700 border-blue-200",

    draft: "bg-slate-100 text-slate-600 border-slate-200",
    pending_approval: "bg-amber-50 text-amber-800 border-amber-300",
    approved: "bg-blue-50 text-blue-700 border-blue-200",
    sent: "bg-purple-50 text-purple-700 border-purple-200",
    partially_received: "bg-amber-100 text-amber-900 border-amber-300",
    received: "bg-emerald-50 text-emerald-800 border-emerald-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200 line-through",

    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-amber-50 text-amber-800 border-amber-300",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };

  const sizeStyles = {
    xs: "px-2 py-0.5 text-[10px]",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  const selectedVariant = variantStyles[variant.toLowerCase().replace(/[\s-]/g, "_")] || variantStyles.default;
  const selectedSize = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold tracking-tight uppercase ${selectedVariant} ${selectedSize} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
