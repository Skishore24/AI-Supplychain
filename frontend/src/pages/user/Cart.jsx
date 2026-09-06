import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowRight, ShieldCheck, CheckCircle2, ShoppingBag, Truck } from "lucide-react";
import Navbar from "../../components/user/Navbar";
import BottomNav from "../../components/user/BottomNav";
import Footer from "../../components/user/Footer";
import { useCart } from "../../context/CartContext";
import { getProductImage } from "../../components/user/ProductCard";

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
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
        <Navbar />
        <main className="flex-grow mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6">
              <CheckCircle2 size={36} />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Order Confirmed</span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              Thank You for Your Order!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Your order <strong className="font-mono text-blue-600 font-bold">{orderCompleted.id}</strong> has been received and is being prepared for immediate dispatch.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-left text-xs sm:text-sm space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span className="text-slate-900 font-bold">{orderCompleted.customer}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Address:</span>
                <span className="text-slate-900 font-medium text-right max-w-xs">{orderCompleted.address}</span>
              </div>
              <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-900">Total Paid:</span>
                <span className="text-lg font-black text-emerald-600">
                  ${Number(orderCompleted?.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/orders")}
                className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
              >
                View in Track Orders
              </button>
              <Link
                to="/shop"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6">
          Shopping Cart ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
        </h1>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-xs">
            <ShoppingBag size={56} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Your Shopping Cart is Empty</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our wide selection of components and tech hardware.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-sm transition"
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-slate-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-50 p-2 border border-slate-100 overflow-hidden">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">SKU: {item.sku}</p>
                      <p className="text-sm font-black text-slate-900 mt-1">${(item.price || 0).toFixed(2)} each</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Quantity controls */}
                    <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-slate-700 hover:bg-slate-200 font-extrabold text-xs rounded-l-xl transition"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-slate-700 hover:bg-slate-200 font-extrabold text-xs rounded-r-xl transition"
                      >
                        +
                      </button>
                    </div>

                    {/* Total for item */}
                    <div className="text-right min-w-20 font-black text-slate-900 text-sm">
                      ${((item.price || 0) * item.quantity).toFixed(2)}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="rounded-lg p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2 text-xs">
                <button
                  onClick={clearCart}
                  className="font-semibold text-slate-500 hover:text-rose-600 transition"
                >
                  Clear all items
                </button>
                <Link to="/shop" className="font-bold text-blue-600 hover:text-blue-700">
                  + Add more products
                </Link>
              </div>
            </div>

            {/* Order Checkout Summary */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Order & Delivery Summary
              </h2>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email for Receipt</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Destination</label>
                  <textarea
                    rows={2}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
                  />
                </div>

                {/* Calculation breakdown */}
                <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping Fee:</span>
                    <span className="text-slate-900 font-bold">
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Estimated Sales Tax (8%):</span>
                    <span className="text-slate-900 font-bold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-3">
                    <span>Order Total:</span>
                    <span className="text-blue-600 text-lg font-black">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="w-full rounded-xl bg-amber-400 hover:bg-amber-500 py-3.5 text-xs font-extrabold text-slate-950 shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-r-transparent"></div>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>100% Secure Checkout Guarantee</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default Cart;