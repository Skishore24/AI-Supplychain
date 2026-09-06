import { useState } from "react";
import { ArrowUpDown, SlidersHorizontal, X, Check, Star } from "lucide-react";

export default function SortFilterBar({
  sortBy,
  onSortChange,
  categories = [],
  selectedCategory,
  onCategoryChange,
  minRating,
  onMinRatingChange,
  activeFilterCount = 0,
  onResetFilters,
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const sortOptions = [
    { label: "Popularity / Relevance", value: "relevance" },
    { label: "Price -- Low to High", value: "price_asc" },
    { label: "Price -- High to Low", value: "price_desc" },
    { label: "Customer Rating", value: "rating" },
    { label: "Newest Arrivals", value: "newest" },
  ];

  return (
    <>
      {/* ── STICKY SORT & FILTER BAR (Flipkart/Amazon Style) ──── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-y border-slate-200/90 shadow-xs font-poppins">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Sort Button */}
          <button
            onClick={() => setSortOpen(true)}
            className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors font-poppins"
          >
            <ArrowUpDown size={15} className="text-amber-600" />
            <span>Sort</span>
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Filter Button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors relative font-poppins"
          >
            <SlidersHorizontal size={15} className="text-amber-600" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950 shadow-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── SORT BOTTOM SHEET / MODAL ───────────────────────── */}
      {sortOpen && (
        <div
          onClick={() => setSortOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fade-in font-poppins"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-heading font-black uppercase tracking-wider text-slate-900">
                Sort By
              </h3>
              <button
                onClick={() => setSortOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800"
                aria-label="Close sort"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 space-y-1">
              {sortOptions.map((opt) => {
                const isSelected = sortBy === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSortChange(opt.value);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left py-3 px-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm font-bold transition-all ${
                      isSelected
                        ? "bg-amber-50 text-amber-900 border border-amber-200/60"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={16} className="text-amber-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER DRAWER / MODAL ───────────────────────────── */}
      {filterOpen && (
        <div
          onClick={() => setFilterOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left overflow-y-auto"
          >
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Filters</h3>
                  <p className="text-[11px] text-slate-400">Refine your catalog search</p>
                </div>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-5 space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                    Category
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["ALL", ...categories].map((cat) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => onCategoryChange(cat)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Rating Filter */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                    Customer Ratings
                  </h4>
                  <div className="space-y-2">
                    {[4, 3, 2].map((stars) => {
                      const isSelected = minRating === stars;
                      return (
                        <button
                          key={stars}
                          onClick={() => onMinRatingChange(isSelected ? 0 : stars)}
                          className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50/50 text-emerald-800"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={13}
                                  className={
                                    i < stars
                                      ? "fill-emerald-500 text-emerald-500"
                                      : "text-slate-200"
                                  }
                                />
                              ))}
                            </span>
                            <span>{stars}★ & above</span>
                          </div>
                          {isSelected && <Check size={15} className="text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button
                onClick={() => {
                  onResetFilters();
                  setFilterOpen(false);
                }}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-white transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-extrabold text-white shadow-md shadow-blue-500/20 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
