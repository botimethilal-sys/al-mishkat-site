import { useState, useEffect } from "react";

export const ADMIN_AUTH_KEY = "al_mishkat_admin_auth";
export const ADMIN_AUTH_EVENT = "admin-auth-change";

export function useAdminAuthStatus(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => sessionStorage.getItem(ADMIN_AUTH_KEY) === "true"
  );

  useEffect(() => {
    const handler = () => {
      setIsAdmin(sessionStorage.getItem(ADMIN_AUTH_KEY) === "true");
    };
    window.addEventListener(ADMIN_AUTH_EVENT, handler);
    return () => window.removeEventListener(ADMIN_AUTH_EVENT, handler);
  }, []);

  return isAdmin;
}
