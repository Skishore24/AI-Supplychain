import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem("emox_admin_token") !== null;
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("emox_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginAdmin = async (email, password) => {
    // Simulated high-security admin credential verification
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPass = password.trim();

    // Accepted secure admin credentials
    if (
      (normalizedEmail === "admin@emox.ai" || normalizedEmail === "admin") &&
      (normalizedPass === "admin123" || normalizedPass === "admin" || normalizedPass === "password123")
    ) {
      const sessionUser = {
        name: "Alex V.",
        role: "Superadmin",
        email: "admin@emox.ai",
        sessionStarted: new Date().toISOString(),
        securityLevel: "Level-3 Enterprise Access"
      };

      const token = `emox_sec_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("emox_admin_token", token);
      localStorage.setItem("emox_admin_user", JSON.stringify(sessionUser));

      setAdminUser(sessionUser);
      setIsAdminAuthenticated(true);
      return { success: true };
    }

    return {
      success: false,
      error: "Access Denied: Invalid administrator email or password."
    };
  };

  const logoutAdmin = () => {
    localStorage.removeItem("emox_admin_token");
    localStorage.removeItem("emox_admin_user");
    setIsAdminAuthenticated(false);
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminUser,
        loginAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
