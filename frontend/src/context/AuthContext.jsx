import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("emox_auth_token") || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("emox_user_data");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Synchronize authentication status on startup
  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem("emox_auth_token");
      if (storedToken) {
        try {
          const profile = await api.auth.getMe();
          setUser(profile);
          localStorage.setItem("emox_user_data", JSON.stringify(profile));
        } catch (err) {
          console.warn("Session verification failed, logging out:", err);
          logout();
        }
      }
      setLoading(false);
    }
    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem("emox_auth_token", res.access_token);
      localStorage.setItem("emox_user_data", JSON.stringify(res.user));
      // Set legacy tokens so any existing components stay compatible
      if (res.user.role === "admin" || res.user.role === "superadmin" || res.user.role === "manager") {
        localStorage.setItem("emox_admin_token", res.access_token);
        localStorage.setItem("emox_admin_user", JSON.stringify(res.user));
      }
      return { success: true, user: res.user };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Invalid credentials. Please verify your email and password.",
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.auth.register(userData);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem("emox_auth_token", res.access_token);
      localStorage.setItem("emox_user_data", JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    try {
      api.auth.logout().catch(() => {});
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("emox_auth_token");
      localStorage.removeItem("emox_user_data");
      localStorage.removeItem("emox_admin_token");
      localStorage.removeItem("emox_admin_user");
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isManager = isAdmin || user?.role === "manager";

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isManager,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
