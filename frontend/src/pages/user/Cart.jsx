import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Truck,
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  QrCode,
  Check,
  AlertCircle
} from "lucide-react";
import Navbar from "../../components/user/Navbar";
import BottomNav from "../../components/user/BottomNav";
import Footer from "../../components/user/Footer";
import { useCart } from "../../context/CartContext";
import { getProductImage } from "../../components/user/ProductCard";
import { toINR, formatINR } from "../../utils/currency";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, checkout } = useCart();
  const navigate = useNavigate();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState("Alex Johnson");
  const [customerEmail, setCustomerEmail] = useState("alex.j@enterprise-tech.io");
  const [shippingAddress, setShippingAddress] = useState("Flat 402, Prestige Tech Park, Marathahalli, Bengaluru, Karnataka 560103");
  const [orderCompleted, setOrderCompleted] = useState(null);

  // Indian Rupee (INR) Payment Options State
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiProvider, setUpiProvider] = useState("gpay");
  const [upiId, setUpiId] = useState("alex.johnson@okhdfcbank");
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [cardDetails, setCardDetails] = useState({
    number: "4532 8920 1145 7823",
    name: "Alex Johnson",
    expiry: "09/29",
    cvv: "891"
  });

  // Calculate pricing in Indian Rupees (INR)
  const subtotalUSD = getCartTotal();
  const subtotalINR = toINR(subtotalUSD);
  const shippingINR = subtotalINR > 2000 || subtotalINR === 0 ? 0 : 499;
  const gstINR = Math.round(subtotalINR * 0.18); // 18% GST standard on hardware
  const totalINR = subtotalINR + shippingINR + gstINR;

  const getFormattedPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case "upi":
        return `UPI (${upiProvider.toUpperCase()}: ${upiId || "Instant"})`;
      case "card":
        return "RuPay / Indian Debit & Credit Card";
      case "netbanking":
        return `Net Banking (${selectedBank})`;
      case "cod":
        return "Cash on Delivery (Cash in ₹)";
      default:
        return "UPI";
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsCheckingOut(true);

    const paymentLabel = getFormattedPaymentMethodLabel();

    const res = await checkout({
      name: customerName,
      email: customerEmail,
      address: shippingAddress,
      paymentMethod: paymentLabel,
      amountINR: totalINR
    });

    setIsCheckingOut(false);
    if (res.success) {
      setOrderCompleted(res.order);
    }
  };

  if (orderCompleted) {
    const paidINR = orderCompleted.total_inr || toINR(orderCompleted.total || 0);

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0 font-poppins">
        <Navbar />
        <main className="flex-grow mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6 shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check size={13} /> Payment Successful & Order Confirmed
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-heading font-black text-slate-900">
              Thank You for Your Order!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Your payment has been processed and order{" "}
              <strong className="font-mono text-blue-600 font-bold">{orderCompleted.id}</strong> has been
              received.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-left text-xs sm:text-sm space-y-3">
              <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-slate-200">
                <span className="font-medium">Amount Paid (INR):</span>
                <span className="text-xl sm:text-2xl font-heading font-black text-emerald-600">
                  {formatINR(paidINR)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 pt-1">
                <span>Payment Mode:</span>
                <span className="text-slate-900 font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-xs">
                  {orderCompleted.payment_method || "UPI"}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Transaction / UTR Reference:</span>
                <span className="font-mono font-bold text-slate-800 text-xs">
                  {orderCompleted.transaction_id || `UPI/UTR/2026/${Math.floor(100000 + Math.random() * 900000)}`}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span className="text-slate-900 font-bold">{orderCompleted.customer}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery Address:</span>
                <span className="text-slate-900 font-medium text-right max-w-xs">{orderCompleted.address}</span>
              </div>

              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span>Tax Invoice Status:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> GST Invoice Generated (18% IN-GST)
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/orders")}
                className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm active:scale-95"
              >
                Track Order in Rupees
              </button>
              <Link
                to="/shop"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95"
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0 font-poppins">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
              Shopping Cart & Checkout
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {cartItems.length} {cartItems.length === 1 ? "item" : "items"} &middot; Prices and billing in{" "}
              <strong className="text-emerald-700 font-bold">Indian Rupees (₹ / INR)</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Accepted: UPI, RuPay, Net Banking, COD</span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-xs">
            <ShoppingBag size={56} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Your Shopping Cart is Empty</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our wide selection of components and tech
              hardware priced in Indian Rupees (₹).
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-sm transition"
            >
              <span>Explore Store in ₹</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              {cartItems.map((item) => {
                const itemINR = toINR(item.price || 0);
                const itemTotalINR = itemINR * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-amber-300"
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
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-heading font-black text-slate-950">
                            {formatINR(itemINR)}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            (${Number(item.price || 0).toFixed(2)}) each
                          </span>
                        </div>
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

                      {/* Total for item in Rupees */}
                      <div className="text-right min-w-24">
                        <div className="font-heading font-black text-slate-900 text-sm">
                          {formatINR(itemTotalINR)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ${((item.price || 0) * item.quantity).toFixed(2)}
                        </div>
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
                );
              })}

              <div className="flex justify-between items-center pt-2 text-xs">
                <button
                  onClick={clearCart}
                  className="font-semibold text-slate-500 hover:text-rose-600 transition"
                >
                  Clear all items
                </button>
                <Link to="/shop" className="font-bold text-amber-700 hover:text-amber-800">
                  + Add more products
                </Link>
              </div>
            </div>

            {/* Order Checkout & Indian Rupee Payment Gateway */}
            <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-heading font-black text-slate-900">
                  Payment in Rupees (₹)
                </h2>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  INR Supported
                </span>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email for Receipt & GST Invoice</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Destination (India)</label>
                  <textarea
                    rows={2}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none resize-none"
                  />
                </div>

                {/* ── PAYMENT METHOD SELECTOR (RUPEES) ─────────────────── */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Select Payment Method:
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {/* UPI */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        paymentMethod === "upi"
                          ? "border-amber-500 bg-amber-50/50 text-slate-950 shadow-xs ring-1 ring-amber-500"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Smartphone size={16} className={paymentMethod === "upi" ? "text-amber-600" : "text-slate-400"} />
                      <div>
                        <div className="leading-tight">UPI / QR</div>
                        <span className="text-[10px] font-normal text-slate-500">GPay, PhonePe, Paytm</span>
                      </div>
                    </button>

                    {/* RuPay / Cards */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        paymentMethod === "card"
                          ? "border-amber-500 bg-amber-50/50 text-slate-950 shadow-xs ring-1 ring-amber-500"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <CreditCard size={16} className={paymentMethod === "card" ? "text-amber-600" : "text-slate-400"} />
                      <div>
                        <div className="leading-tight">RuPay / Cards</div>
                        <span className="text-[10px] font-normal text-slate-500">Debit / Credit</span>
                      </div>
                    </button>

                    {/* Net Banking */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("netbanking")}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        paymentMethod === "netbanking"
                          ? "border-amber-500 bg-amber-50/50 text-slate-950 shadow-xs ring-1 ring-amber-500"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Building2 size={16} className={paymentMethod === "netbanking" ? "text-amber-600" : "text-slate-400"} />
                      <div>
                        <div className="leading-tight">Net Banking</div>
                        <span className="text-[10px] font-normal text-slate-500">Indian Banks</span>
                      </div>
                    </button>

                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        paymentMethod === "cod"
                          ? "border-amber-500 bg-amber-50/50 text-slate-950 shadow-xs ring-1 ring-amber-500"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Banknote size={16} className={paymentMethod === "cod" ? "text-amber-600" : "text-slate-400"} />
                      <div>
                        <div className="leading-tight">Cash on Delivery</div>
                        <span className="text-[10px] font-normal text-slate-500">Pay cash in ₹</span>
                      </div>
                    </button>
                  </div>

                  {/* Payment method specific details */}
                  {paymentMethod === "upi" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-3">
                      <div className="flex gap-2 text-xs">
                        {["gpay", "phonepe", "paytm", "bhim"].map((provider) => (
                          <button
                            key={provider}
                            type="button"
                            onClick={() => setUpiProvider(provider)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase transition-all ${
                              upiProvider === provider
                                ? "bg-amber-500 text-slate-950 shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {provider}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Enter UPI ID</label>
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@okhdfcbank"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setShowQrModal(!showQrModal)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
                        >
                          <QrCode size={14} />
                          <span>{showQrModal ? "Hide UPI QR Code" : "Scan UPI QR Code to Pay"}</span>
                        </button>
                        <span className="text-[10px] text-slate-500">Instant ₹ settlement</span>
                      </div>

                      {showQrModal && (
                        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200">
                          {/* Clean SVG QR code simulation for UPI Payment */}
                          <svg className="h-32 w-32" viewBox="0 0 100 100" fill="none">
                            <rect width="100" height="100" fill="white" />
                            {/* Corner 1 */}
                            <rect x="10" y="10" width="24" height="24" rx="3" fill="#0F172A" />
                            <rect x="14" y="14" width="16" height="16" fill="white" />
                            <rect x="18" y="18" width="8" height="8" fill="#0F172A" />
                            {/* Corner 2 */}
                            <rect x="66" y="10" width="24" height="24" rx="3" fill="#0F172A" />
                            <rect x="70" y="14" width="16" height="16" fill="white" />
                            <rect x="74" y="18" width="8" height="8" fill="#0F172A" />
                            {/* Corner 3 */}
                            <rect x="10" y="66" width="24" height="24" rx="3" fill="#0F172A" />
                            <rect x="14" y="70" width="16" height="16" fill="white" />
                            <rect x="18" y="74" width="8" height="8" fill="#0F172A" />
                            {/* Center and dots */}
                            <circle cx="50" cy="50" r="8" fill="#D97706" />
                            <rect x="40" y="20" width="6" height="6" fill="#0F172A" />
                            <rect x="52" y="24" width="8" height="6" fill="#0F172A" />
                            <rect x="20" y="44" width="6" height="12" fill="#0F172A" />
                            <rect x="74" y="44" width="10" height="6" fill="#0F172A" />
                            <rect x="44" y="70" width="14" height="8" fill="#0F172A" />
                            <rect x="66" y="70" width="8" height="12" fill="#0F172A" />
                            <rect x="80" y="80" width="10" height="10" fill="#0F172A" />
                          </svg>
                          <p className="text-[11px] font-bold text-slate-800 mt-2">
                            Scan with GPay / PhonePe / Paytm
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Pay exactly: <strong className="text-emerald-700">{formatINR(totalINR)}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number (RuPay / Visa / MC)</label>
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-slate-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">CVV</label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "netbanking" && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs">
                      <label className="block text-[11px] font-bold text-slate-700">Select Bank:</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                      </select>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle size={14} className="text-amber-700" />
                        <span>Pay with Cash in Indian Rupees</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Please keep <strong className="text-slate-900 font-bold">{formatINR(totalINR)}</strong> in cash ready
                        for courier delivery. Delivery partners also carry UPI QR scanners for on-spot digital payment.
                      </p>
                    </div>
                  )}
                </div>

                {/* Calculation breakdown in Indian Rupees */}
                <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="text-slate-900 font-bold">{formatINR(subtotalINR)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping & Freight:</span>
                    <span className="text-slate-900 font-bold">
                      {shippingINR === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE (Orders &gt; ₹2,000)</span>
                      ) : (
                        formatINR(shippingINR)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (18% Indian Tax):</span>
                    <span className="text-slate-900 font-bold">{formatINR(gstINR)}</span>
                  </div>
                  <div className="flex justify-between text-base font-heading font-black text-slate-900 border-t border-slate-200 pt-3">
                    <span>Total Payable (INR):</span>
                    <span className="text-emerald-700 text-xl">{formatINR(totalINR)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 text-right">
                    Equivalent: ~${(totalINR / 83).toFixed(2)} USD
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="w-full rounded-xl bg-amber-400 hover:bg-amber-500 py-3.5 text-xs font-extrabold text-slate-950 shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-r-transparent"></div>
                      <span>Authorizing ₹ Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Pay {formatINR(totalINR)} in Rupees</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>100% Encrypted Payment &middot; RBI Compliant Gateway</span>
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