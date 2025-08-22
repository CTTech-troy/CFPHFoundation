/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Auto-login from storage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("authUser")) || JSON.parse(sessionStorage.getItem("authUser"));
    if (storedUser) setUser(storedUser);
  }, []);

  // Auto-logout after 10 min inactivity
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      if (user) {
        timeout = setTimeout(() => {
          logout();
          alert("Session expired due to inactivity.");
        }, 10 * 60 * 1000); // 10 minutes
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timeout);
    };
  }, [user]);

  const login = (userData, rememberMe = false) => {
    setUser(userData);
    if (rememberMe) localStorage.setItem("authUser", JSON.stringify(userData));
    else sessionStorage.setItem("authUser", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    sessionStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
