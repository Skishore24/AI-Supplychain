import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "btn-press inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variants = {
    primary:
      "bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950 shadow-xs focus:ring-slate-950",
    amber:
      "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xs focus:ring-amber-400",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 focus:ring-slate-400",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-400 shadow-xs",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-xs focus:ring-rose-500",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs focus:ring-emerald-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-xs sm:text-sm",
    lg: "px-5 py-2.5 text-sm",
    icon: "h-9 w-9 p-0",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={15} className="shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;
