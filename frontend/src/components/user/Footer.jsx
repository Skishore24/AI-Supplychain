import { Link } from "react-router-dom";
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-auto">
      {/* Trust Badges Strip (Amazon / Flipkart Style) */}
      <div className="border-b border-slate-100 bg-slate-50/70 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Free Fast Delivery</h4>
                <p className="text-[11px] text-slate-500">On orders over ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">100% Original Products</h4>
                <p className="text-[11px] text-slate-500">Direct from verified brands</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <RotateCcw size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Easy 7-Day Returns</h4>
                <p className="text-[11px] text-slate-500">Hassle-free replacements</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Secure Checkout</h4>
                <p className="text-[11px] text-slate-500">256-bit encrypted payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

          {/* Brand Col */}
          <div className="md:col-span-1 font-poppins">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-heading font-black text-slate-900 tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-700 text-white border border-amber-500/30 shadow-xs">
                <ShoppingBag size={17} className="text-amber-400" />
              </span>
              <span className="font-heading font-black text-2xl text-slate-900">
                E<span className="text-amber-500">kart</span>
              </span>
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-slate-500 font-poppins">
              Your ultimate destination for authentic electronics, computing, smart accessories, and lifestyle essentials. Built for modern luxury retail convenience.
            </p>
          </div>

          {/* Categories */}
          <div className="font-poppins">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-950">Explore Catalog</h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link to="/shop" className="text-slate-600 hover:text-amber-700 transition">All Products</Link>
              </li>
              <li>
                <Link to="/shop" className="text-slate-600 hover:text-amber-700 transition">Featured Deals</Link>
              </li>
              <li>
                <Link to="/shop" className="text-slate-600 hover:text-amber-700 transition">Best Sellers</Link>
              </li>
              <li>
                <Link to="/shop" className="text-slate-600 hover:text-amber-700 transition">New Arrivals</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Customer Care</h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link to="/orders" className="text-slate-600 hover:text-blue-600 transition">Track Your Order</Link>
              </li>
              <li>
                <Link to="/cart" className="text-slate-600 hover:text-blue-600 transition">Shopping Bag</Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-600 hover:text-blue-600 transition">Account & Profile</Link>
              </li>
              <li>
                <span className="text-slate-400">Help Center (24/7)</span>
              </li>
            </ul>
          </div>

          {/* Policies & Safe Shopping */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Buyer Protection</h3>
            <ul className="mt-4 space-y-2 text-xs text-slate-500">
              <li>100% Genuine Quality Guarantee</li>
              <li>Certified Payment Gateways</li>
              <li>Instant Shipment Notifications</li>
              <li>Cash on Delivery & Cards Accepted</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200 pt-6 sm:flex-row text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Ekart Inc. All rights reserved.</p>
          <div className="mt-3 flex items-center gap-4 sm:mt-0 text-slate-400">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
