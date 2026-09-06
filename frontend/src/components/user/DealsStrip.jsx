import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";

export default function DealsStrip({
  title = "Top Sale Deals",
  subtitle = "Shop at unbeatable prices",
  to = "/shop",
}) {
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 my-3">
      <Link
        to={to}
        className="group relative flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#5942D2] via-[#6349DE] to-[#4E35CD] px-4 py-3 sm:px-6 sm:py-4 text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:shadow-indigo-600/35 hover:scale-[1.008] active:scale-[0.99]"
      >
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-black tracking-tight text-white">
            {title}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-indigo-100 font-medium">
            <Clock size={12} className="text-indigo-200" />
            <span>{subtitle}</span>
          </div>
        </div>

        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-indigo-600 shadow-md transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-amber-300 group-hover:text-slate-950">
          <ArrowRight size={18} />
        </div>
      </Link>
    </div>
  );
}
