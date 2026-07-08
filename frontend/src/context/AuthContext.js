import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearSession, getStoredUser, saveSession, storageKeys } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(storageKeys.access)));

  useEffect(() => {
    if (!localStorage.getItem(storageKeys.access)) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then((currentUser) => {
        localStorage.setItem(storageKeys.user, JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (username, password) => {
        const data = await api.login(username, password);
        saveSession(data);
        setUser(data.user);
      },
      register: async (payload) => {
        const username = payload.username || payload.email;
        await api.register({ ...payload, username, role: "student" });
        const data = await api.login(payload.email, payload.password);
        saveSession(data);
        setUser(data.user);
      },
      logout: () => {
        clearSession();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
