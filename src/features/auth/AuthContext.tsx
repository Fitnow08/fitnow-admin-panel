import { createContext, use, useState, type ReactNode } from "react";
import { isAxiosError } from "axios";
import {
  api,
  clearToken,
  getToken,
  setRefreshToken,
  setToken,
} from "@/lib/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Соответствует Go-структуре User (json snake_case)
interface ILoginResponse {
  id: string;
  email: string;
  title: string;
  refresh_token: string;
  access_token: string;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());

  async function login(email: string, password: string) {
    try {
      const { data } = await api.post<ILoginResponse>("/auth/login", {
        email,
        password,
      });
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setIsAuthenticated(true);
    } catch (error) {
      if (isAxiosError(error)) {
        // ответ пришёл, но со статусом ошибки (401, 400, 500…)
        console.error(
          "Login failed:",
          error.response?.status,
          error.response?.data,
        );
        // запрос ушёл, но ответа нет (сеть, CORS, сервер недоступен)
        if (!error.response) console.error("No response:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error; // пробрасываем, чтобы LoginPage показал сообщение пользователю
    }
  }

  function logout() {
    clearToken();
    setIsAuthenticated(false);
  }

  return (
    <AuthContext value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
