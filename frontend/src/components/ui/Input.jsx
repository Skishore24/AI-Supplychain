import React from "react";

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = "",
  containerClassName = "",
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-slate-700"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 text-slate-400">
            <Icon size={15} />
          </div>
        )}

        <input
          id={inputId}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
            Icon ? "pl-10" : ""
          } ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-amber-500"
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  error,
  children,
  className = "",
  containerClassName = "",
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-bold text-slate-700"
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={`w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
          error ? "border-rose-400 focus:border-rose-500" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </select>

      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

export default Input;
