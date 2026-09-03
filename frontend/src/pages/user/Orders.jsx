import { Link } from "react-router-dom";
import { Package, ArrowRight, Truck } from "lucide-react";
import Navbar from "../../components/user/Navbar";

import Footer from "../../components/user/Footer";
import { useCart } from "../../context/CartContext";

function Orders() {
  const { orders } = useCart();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-5xl px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Order History & Tracking</h1>
            <p className="mt-1 text-sm text-slate-400">
              Review live shipment statuses and autonomous fulfillment logs.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md transition"
          >
            <span>Order New Items</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/60 p-16 text-center backdrop-blur-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-4">
              <Package size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">No Orders Placed Yet</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              Once you checkout items from your shopping cart, real-time AI supply chain fulfillment tracking will appear here.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order, idx) => (
              <div
                key={order.id || idx}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-xl transition hover:border-slate-700"
              >
                {/* Header bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/90 px-6 py-4">
                  <div>
                    <span className="text-xs text-slate-400">Order ID:</span>
                    <div className="font-mono text-sm font-bold text-blue-400">{order.id}</div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Date Placed:</span>
                    <div className="text-xs font-semibold text-white">{order.date}</div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Total:</span>
                    <div className="text-sm font-extrabold text-emerald-400">${Number(order.total).toFixed(2)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                      <Truck size={12} /> {order.status || "Fulfillment Active"}
                    </span>
                  </div>
                </div>

                {/* Body / Items list */}
                <div className="p-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Purchased Components
                  </div>

                  <div className="space-y-3">
                    {order.items &&
                      order.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 text-sm"
                        >
                          <div>
                            <span className="font-medium text-white">{item.product_name || item.name}</span>
                            <span className="ml-2 text-xs text-slate-400 font-mono">
                              x{item.quantity} units
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-300">
                            ${((item.unit_price || item.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>

                  {order.address && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                      <span>Destination: <strong className="text-slate-300">{order.address}</strong></span>
                      <span className="text-blue-400">Standard Freight Delivery</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Orders;