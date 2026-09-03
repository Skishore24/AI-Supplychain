import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowRight, ShieldCheck, CheckCircle, Package } from "lucide-react";
import Navbar from "../../components/user/Navbar";

import Footer from "../../components/user/Footer";
import { useCart } from "../../context/CartContext";

const getCategoryIcon = (category = "") => {
  const cat = category.toLowerCase();
  if (cat.includes("batter") || cat.includes("energy")) return "🔋";
  if (cat.includes("semi") || cat.includes("mcu") || cat.includes("arm")) return "⚡";
  if (cat.includes("display") || cat.includes("oled") || cat.includes("screen")) return "🖥️";
  if (cat.includes("motor") || cat.includes("actuator")) return "⚙️";
  if (cat.includes("thermal") || cat.includes("heat")) return "❄️";
  if (cat.includes("sensor")) return "📡";
  return "📦";
};

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, checkout } = useCart();
  const navigate = useNavigate();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState("Alex Johnson");
  const [customerEmail, setCustomerEmail] = useState("alex.j@enterprise-tech.io");
  const [shippingAddress, setShippingAddress] = useState("450 Innovation Parkway, Suite 10, Austin TX 78701");
  const [orderCompleted, setOrderCompleted] = useState(null);

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 || subtotal === 0 ? 0.0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsCheckingOut(true);

    const res = await checkout({
      name: customerName,
      email: customerEmail,
      address: shippingAddress
    });

    setIsCheckingOut(false);
    if (res.success) {
      setOrderCompleted(res.order);
    }
  };

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow mx-auto w-full max-w-3xl px-6 py-16">
          <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-6">
              <CheckCircle size={36} />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Order Confirmed</span>
            <h1 className="mt-2 text-3xl font-extrabold text-white">
              Thank You for Your Order!
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Order <span className="font-mono text-blue-400 font-bold">{orderCompleted.id}</span> has been processed and supply chain inventory decremented.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-left text-sm space-y-3">
              <div className="flex justify-between text-slate-400">
                <span>Customer:</span>
                <span className="text-white font-medium">{orderCompleted.customer}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Address:</span>
                <span className="text-white font-medium">{orderCompleted.address}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-3">
                <span>Total Paid:</span>
                <span className="text-lg font-bold text-emerald-400">${orderCompleted.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/orders")}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/30"
              >
                View in My Orders
              </button>
              <Link
                to="/shop"
                className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-extrabold text-white mb-8">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-16 text-center backdrop-blur-md">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              Explore our catalogue to add certified electronics, motors, sensors, and hardware components.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition"
            >
              <span>Explore Store</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md transition hover:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800 text-3xl">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{item.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">SKU: {item.sku}</p>
                      <p className="text-sm font-bold text-blue-400 mt-1">${(item.price || 0).toFixed(2)} each</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {/* Quantity controls */}
                    <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-slate-400 hover:text-white font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-white min-w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-slate-400 hover:text-white font-bold text-sm"
                      >
                        +
                      </button>
                    </div>

                    {/* Total for item */}
                    <div className="text-right min-w-20 font-bold text-white">
                      ${((item.price || 0) * item.quantity).toFixed(2)}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10 transition"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition"
                >
                  Clear entire cart
                </button>
                <Link to="/shop" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                  + Add more items
                </Link>
              </div>
            </div>

            {/* Order Checkout Summary */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md shadow-xl space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
                Order & Shipping Summary
              </h2>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email for Invoicing</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Fulfillment Address</label>
                  <textarea
                    rows={2}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Calculation breakdown */}
                <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Shipping:</span>
                    <span className="text-white font-medium">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Tax (8%):</span>
                    <span className="text-white font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-3">
                    <span>Grand Total:</span>
                    <span className="text-blue-400 text-base">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                      <span>Dispatching Order...</span>
                    </>
                  ) : (
                    <>
                      <Package size={16} />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>AI Automated Inventory Decrement Guarantee</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Cart;