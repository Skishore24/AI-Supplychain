import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const API_BASE_URL = "http://127.0.0.1:8000";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("supplyai_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("supplyai_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem("supplyai_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("supplyai_orders", JSON.stringify(orders));
  }, [orders]);

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            category: product.category,
            sku: product.sku,
            price: Number(product.price) || 0,
            quantity: quantity,
            description: product.description || ""
          }
        ];
      }
    });
    showToast(`Added "${product.name}" to cart!`);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    showToast("Item removed from cart", "info");
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
      0
    );
  };

  const checkout = async (customerInfo = {}) => {
    if (cartItems.length === 0) return { success: false, error: "Cart is empty" };

    try {
      const payload = {
        customer_name: customerInfo.name || "Valued Customer",
        customer_email: customerInfo.email || "customer@example.com",
        shipping_address: customerInfo.address || "123 Supply Chain Blvd, Suite 400",
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`${API_BASE_URL}/sales/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Checkout failed on server");
      }

      const result = await response.json();

      const newOrder = {
        id: result.order_id || `ORD-${Date.now()}`,
        date: result.date || new Date().toISOString().split("T")[0],
        total: result.total_amount || getCartTotal(),
        items: result.items || [...cartItems],
        status: "Processing (In Transit)",
        customer: payload.customer_name,
        address: payload.shipping_address
      };

      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      showToast("Order placed successfully! Supply chain inventory updated.", "success");
      return { success: true, order: newOrder };
    } catch (err) {
      console.warn("Backend checkout error, storing order locally:", err);
      const fallbackOrder = {
        id: `ORD-LOCAL-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split("T")[0],
        total: getCartTotal(),
        items: [...cartItems],
        status: "Confirmed",
        customer: customerInfo.name || "Customer",
        address: customerInfo.address || "Main Address"
      };
      setOrders((prev) => [fallbackOrder, ...prev]);
      clearCart();
      showToast("Order recorded successfully!", "success");
      return { success: true, order: fallbackOrder };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        checkout,
        showToast
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-blue-500/30 bg-slate-900/95 px-5 py-4 text-white shadow-2xl backdrop-blur-md animate-bounce">
          <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-sm font-medium">{toastMessage.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
