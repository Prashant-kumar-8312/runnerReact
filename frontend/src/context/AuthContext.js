import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../Services/api.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/me");

      setUser(response.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const response = await api.post(
      "/auth/login",
      {
        identifier,
        password
      }
    );

    setUser(response.data.user);
  };

  const register = async (
    name,
    username,
    email,
    password
  ) => {
    const response = await api.post(
      "/auth/register",
      {
        name,
        username,
        email,
        password
      }
    );

    setUser(response.data.user);
  };

  const logout = async () => {
    await api.post("/auth/logout");

    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        login,
        register,
        logout
      }
    },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}