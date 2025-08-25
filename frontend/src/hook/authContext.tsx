// src/auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
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
  role_id: number | string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  authReady: boolean; // ✅ บอกว่า hydrate เสร็จหรือยัง
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

// ช่วยเช็คหมดอายุจาก exp (ถ้าไม่มี exp จะถือว่ายังไม่หมดอายุ)
const isJwtExpired = (token: string | null | undefined) => {
  if (!token) return true;
  const payload: any = safeDecodeJwt(token);
  const exp = payload?.exp;
  if (!exp) return false;
  return Date.now() >= exp * 1000;
};


const combineNames = (
  firstname?: string,
  lastname?: string,
  existingName?: string
): string => {
  const first = firstname?.trim() || "";
  const last = lastname?.trim() || "";
  const combined = [first, last].filter(Boolean).join(" ");
  return combined || existingName || "";
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const uStr = localStorage.getItem("user");
    // const r = localStorage.getItem("role");
    // const rid = localStorage.getItem("role_id");

    if (t && !isJwtExpired(t)) {
      setToken(t);
      axios.defaults.headers.common.Authorization = `Bearer ${t}`;
      if (uStr) {
        try {
          setUser(JSON.parse(uStr));
        } catch {
          setUser(null);
        }
      }
      // เก็บ role/role_id ไว้ใน state user ถ้าต้องการ (ไม่จำเป็นตรงนี้เพราะมักอยู่ใน user อยู่แล้ว)
    } else {
      // token หมดอายุ/ไม่มี → ล้างทิ้ง
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("role_id");
      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common.Authorization;
    }

    setAuthReady(true);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    const res = await axios.post(`${API_URL}/signin`, { email, password });
    const data = res.data || {};
    const token = data.token ?? data.accessToken ?? data.access_token;

    if (!token) throw new Error("No token returned from server");

    const role = data.role ?? data.user?.role;
    const role_id = data.role_id ?? data.user?.role_id;

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    let userObj: User | null = data.user ?? null;

    // สร้าง name จาก firstname + lastname
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
        // fallback จาก JWT
        const payload: any = safeDecodeJwt(token);
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
                name: combinedNameFromJwt,
                role,
                role_id,
              }
            : null;
      }
    }


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
    delete axios.defaults.headers.common.Authorization;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("role_id");
  };

  return (
    <AuthContext.Provider value={{ user, token, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);