import { Link } from "react-router-dom";
import { Package, ArrowRight, Truck, CheckCircle2, ShieldCheck } from "lucide-react";
import Navbar from "../../components/user/Navbar";
import BottomNav from "../../components/user/BottomNav";
import Footer from "../../components/user/Footer";
import { useCart } from "../../context/CartContext";
import { formatINR, toINR } from "../../utils/currency";

function Orders() {
  const { orders } = useCart();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0 font-poppins">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
              Track Orders & History
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              View live delivery tracking and receipts for your previous purchases in{" "}
              <strong className="text-emerald-700 font-bold">Indian Rupees (₹ / INR)</strong>.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-xs transition self-start sm:self-auto"
          >
            <span>Order New Items</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <Package size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Orders Placed Yet</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Once you place an order in your shopping cart, real-time shipment updates, UPI/RuPay payment records, and
              delivery receipts will appear here.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-xs transition"
            >
              Start Shopping in ₹
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {orders.map((order, idx) => {
              const amountINR = order.total_inr || toINR(order.total || 0);

              return (
                <div
                  key={order.id || idx}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-amber-300"
                >
                  {/* Header bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-3.5 text-xs">
                    <div>
                      <span className="text-slate-400">Order Reference:</span>
                      <div className="font-mono font-bold text-blue-600">{order.id}</div>
                    </div>

                    <div>
                      <span className="text-slate-400">Order Date:</span>
                      <div className="font-semibold text-slate-800">{order.date}</div>
                    </div>

                    <div>
                      <span className="text-slate-400">Paid Total:</span>
                      <div className="font-heading font-black text-slate-950 text-base">
                        {formatINR(amountINR)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        (${Number(order.total || 0).toFixed(2)} USD)
                      </div>
                    </div>

                    {order.payment_method && (
                      <div>
                        <span className="text-slate-400">Payment:</span>
                        <div className="font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded text-[11px] mt-0.5">
                          {order.payment_method}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <Truck size={13} /> {order.status || "Dispatched — In Transit"}
                      </span>
                    </div>
                  </div>

                  {/* Body / Items list */}
                  <div className="p-6">
                    {order.transaction_id && (
                      <div className="mb-3 text-[11px] font-mono text-slate-500 flex items-center gap-2">
                        <span className="font-bold text-slate-700">Txn/UTR:</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold">
                          {order.transaction_id}
                        </span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <ShieldCheck size={12} /> Settled
                        </span>
                      </div>
                    )}

                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Purchased Items ({order.items?.length || 0})
                    </div>

                    <div className="space-y-2">
                      {order.items &&
                        order.items.map((item, itemIdx) => {
                          const unitPriceINR = toINR(item.unit_price || item.price || 0);
                          const lineTotalINR = unitPriceINR * (item.quantity || 1);

                          return (
                            <div
                              key={itemIdx}
                              className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs sm:text-sm"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{item.product_name || item.name}</span>
                                <span className="ml-2 text-xs text-slate-500 font-mono">
                                  × {item.quantity} units
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-heading font-black text-slate-900">
                                  {formatINR(lineTotalINR)}
                                </span>
                                <span className="block text-[10px] text-slate-400">
                                  ${((item.unit_price || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {order.address && (
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>
                          Delivery Address: <strong className="text-slate-800">{order.address}</strong>
                        </span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={13} /> BlueDart Express Cargo &middot; Fast Delivery
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default Orders;