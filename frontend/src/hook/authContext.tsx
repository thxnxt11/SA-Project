// src/auth/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

export type User = {
  id?: number | string;
  firstname?: string;
  lastname?: string;
  name?: string;
  email?: string;
  role?: string | number;
  role_id?: number | string;
};

type LoginResult = {
  token: string;
  user: User | null;
  role: string | number;
  role_id: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const safeDecodeJwt = (token: string) => {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
};

// Helper function to combine firstname and lastname into name
const combineNames = (
  firstname?: string,
  lastname?: string,
  existingName?: string
): string => {
  const first = firstname?.trim() || "";
  const last = lastname?.trim() || "";
  const combined = [first, last].filter(Boolean).join(" ");

  // If we have firstname or lastname, use the combined name
  // Otherwise, keep the existing name
  return combined || existingName || "";
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    const res = await axios.post(`${API_URL}/signin`, {
      email,
      password,
    });
    const data = res.data || {};
    const token = data.token ?? data.accessToken ?? data.access_token;

    if (!token) throw new Error("No token returned from server");

    const role = data.role ?? data.user?.role;
    const role_id = data.role_id ?? data.user?.role_id;

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    let userObj: User | null = data.user ?? null;

    // If userObj exists, ensure name is firstname + lastname
    if (userObj) {
      const combinedName = combineNames(
        userObj.firstname,
        userObj.lastname,
        userObj.name
      );
      userObj = {
        ...userObj,
        name: combinedName,
      };
    }

    if (!userObj) {
      try {
        const me = await axios.get(`${API_URL}/auth/profile`);
        const profileData = me.data ?? null;

        if (profileData) {
          const combinedName = combineNames(
            profileData.firstname,
            profileData.lastname,
            profileData.name
          );
          userObj = {
            ...profileData,
            name: combinedName,
          };
        }
      } catch {
        const payload = safeDecodeJwt(token);
        const emailFromJwt =
          payload.Email || payload.email || payload.username || "";
        const firstnameFromJwt = payload.firstname || payload.Firstname || "";
        const lastnameFromJwt = payload.lastname || payload.Lastname || "";
        const existingNameFromJwt = payload.name || payload.Name || "";
        const combinedNameFromJwt = combineNames(
          firstnameFromJwt,
          lastnameFromJwt,
          existingNameFromJwt
        );

        userObj =
          emailFromJwt || combinedNameFromJwt
            ? {
                email: emailFromJwt || undefined,
                firstname: firstnameFromJwt || undefined,
                lastname: lastnameFromJwt || undefined,
                name: combinedNameFromJwt ,
                role,
                role_id,
              }
            : null;
      }
    }

    // Update state + localStorage
    setToken(token);
    setUser(userObj);

    localStorage.setItem("token", token);
    if (role !== undefined) localStorage.setItem("role", String(role));
    if (role_id !== undefined) localStorage.setItem("role_id", String(role_id));
    if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
    else localStorage.removeItem("user");

    return { token, user: userObj, role, role_id };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
