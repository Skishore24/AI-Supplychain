import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  MapPin,
  Package,
  Pencil,
  Check,
  X,
  Phone,
  Mail,
  User,
  Sparkles,
  RotateCcw
} from "lucide-react";
import Navbar from "../../components/user/Navbar";
import BottomNav from "../../components/user/BottomNav";
import Footer from "../../components/user/Footer";
import { useCart } from "../../context/CartContext";

function Profile() {
  const { user, updateUser, orders, getCartCount } = useCart();
  const cartCount = getCartCount();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "Alex Johnson",
    email: user.email || "alex.johnson@enterprise-tech.io",
    phone: user.phone || "+1 (555) 234-5678",
    primaryAddress: user.primaryAddress || "450 Innovation Parkway, Suite 10, Austin TX 78701",
    membershipTier: user.membershipTier || "Gold Prime Member",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync form when opening edit mode
  const handleOpenEdit = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "+1 (555) 234-5678",
      primaryAddress: user.primaryAddress || "",
      membershipTier: user.membershipTier || "Gold Prime Member",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Compute live avatar initials
  const displayInitials = (formData.name || user.name || "U")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col justify-between pb-16 md:pb-0 font-poppins">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 tracking-tight">
              My Account & Preferences
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your personal information, shipping addresses, and order history.
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={handleOpenEdit}
              className="btn-press inline-flex items-center gap-2 rounded-xl bg-slate-950 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all duration-200 self-start sm:self-auto"
            >
              <Pencil size={14} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition"
              >
                <Check size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>

        {savedSuccess && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs font-bold text-emerald-800 animate-slide-down shadow-xs">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>Profile successfully updated in real time! Changes are active immediately.</span>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {/* User Card (Left column) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 text-center shadow-xs transition-all hover:shadow-md h-fit relative">
            {!isEditing && (
              <button
                onClick={handleOpenEdit}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                title="Edit profile"
                aria-label="Edit profile"
              >
                <Pencil size={15} />
              </button>
            )}

            {/* Avatar */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-700 text-white shadow-md text-2xl font-black mb-3 border border-amber-500/30">
              {isEditing ? displayInitials : (user.avatar || displayInitials)}
            </div>

            <h2 className="text-lg font-heading font-black text-slate-950">
              {isEditing ? formData.name || "Your Name" : user.name}
            </h2>

            <span className="inline-block mt-1.5 rounded-full bg-amber-50 border border-amber-300/60 px-3 py-0.5 text-[11px] font-extrabold text-amber-900">
              {isEditing ? formData.membershipTier : user.membershipTier}
            </span>

            <p className="mt-2 text-xs text-slate-500 font-medium">
              {isEditing ? formData.email : user.email}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3.5 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">
                  Default Shipping:
                </span>
                <span className="font-medium text-slate-800 flex items-start gap-1.5 mt-0.5 leading-snug">
                  <MapPin size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  {isEditing ? formData.primaryAddress : user.primaryAddress}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">
                  Contact Phone:
                </span>
                <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone size={13} className="text-amber-600 shrink-0" />
                  {isEditing ? formData.phone : user.phone || "+1 (555) 234-5678"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">
                  Customer Since:
                </span>
                <span className="font-semibold text-slate-800">
                  {user.joinedDate || "March 2026"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editable Form or Activity Overview */}
          <div className="md:col-span-2 space-y-6">
            {isEditing ? (
              /* REAL-TIME EDIT FORM */
              <form onSubmit={handleSave} className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-heading font-black text-slate-900">
                      Edit Personal Information
                    </h3>
                    <p className="text-xs text-slate-500">
                      Changes update in real time across your profile, orders, and navigation.
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 border border-amber-200">
                    Live Real-Time
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Alex Johnson"
                        className="input-smooth w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="alex.johnson@enterprise-tech.io"
                        className="input-smooth w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+1 (555) 234-5678"
                        className="input-smooth w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                      />
                    </div>
                  </div>

                  {/* Membership Tier */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Membership Tier
                    </label>
                    <select
                      value={formData.membershipTier}
                      onChange={(e) => handleChange("membershipTier", e.target.value)}
                      className="input-smooth w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                    >
                      <option value="Gold Prime Member">Gold Prime Member</option>
                      <option value="Platinum VIP Member">Platinum VIP Member</option>
                      <option value="Diamond Elite">Diamond Elite</option>
                      <option value="Silver Member">Silver Member</option>
                    </select>
                  </div>
                </div>

                {/* Primary Shipping Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Primary Shipping Address
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3 text-slate-400" />
                    <textarea
                      rows={3}
                      required
                      value={formData.primaryAddress}
                      onChange={(e) => handleChange("primaryAddress", e.target.value)}
                      placeholder="450 Innovation Parkway, Suite 10, Austin TX 78701"
                      className="input-smooth w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-press rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-amber-600 px-5 py-2 text-xs font-black text-white shadow-md transition"
                  >
                    <Check size={14} />
                    <span>Save in Real Time</span>
                  </button>
                </div>
              </form>
            ) : (
              /* STANDARD ACTIVITY & QUICK NAVIGATION */
              <>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
                Activity Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="text-xs text-slate-500">Orders Placed</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{orders.length}</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="text-xs text-slate-500">Cart Items</span>
                  <div className="text-2xl font-black text-blue-600 mt-1 flex items-center gap-1.5">
                    {cartCount} units
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
                Quick Navigation
              </h3>
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-blue-400 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Package size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">Track Orders & Receipts</div>
                      <div className="text-[11px] text-slate-500">Review all previously placed orders</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">Open</span>
                </Link>

                <Link
                  to="/shop"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-blue-400 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">Explore Catalog</div>
                      <div className="text-[11px] text-slate-500">Browse trending tech components and hardware</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">Browse</span>
                </Link>

                <Link
                  to="/cart"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-blue-400 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">Shopping Cart</div>
                      <div className="text-[11px] text-slate-500">Manage items ready for checkout</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600">View Cart</span>
                </Link>
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default Profile;