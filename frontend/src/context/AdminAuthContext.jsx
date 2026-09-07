import { createContext, useContext } from "react";
import { AuthProvider, useAuth } from "./AuthContext";

export { AuthProvider as AdminAuthProvider };

export function useAdminAuth() {
  const { user, login, logout, isAdmin, isAuthenticated, loading } = useAuth();
  return {
    isAdminAuthenticated: isAuthenticated && isAdmin,
    adminUser: user,
    loginAdmin: login,
    logoutAdmin: logout,
    loading,
  };
}

export default useAdminAuth;
