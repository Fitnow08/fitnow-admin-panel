import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const ACCESS_KEY = "fitnow_admin_token";
const REFRESH_KEY = "fitnow_admin_refresh";

export const getToken = () => localStorage.getItem(ACCESS_KEY);
export const setToken = (token: string) =>
  localStorage.setItem(ACCESS_KEY, token);

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (token: string) =>
  localStorage.setItem(REFRESH_KEY, token);

export const clearToken = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

const baseURL = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Отдельный «чистый» клиент для refresh — без перехватчиков,
// чтобы 401 от самого refresh не зациклил логику.
const refreshClient = axios.create({ baseURL });

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

// Single-flight: если несколько запросов словили 401 одновременно,
// refresh выполняется один раз, остальные ждут его результата.
let refreshPromise: Promise<string> | null = null;

function refreshTokens(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const refresh = getRefreshToken();
  if (!refresh) return Promise.reject(new Error("No refresh token"));

  refreshPromise = refreshClient
    .post<RefreshResponse>("/auth/refresh", { refresh_token: refresh })
    .then(({ data }) => {
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
      return data.access_token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function forceLogout() {
  clearToken();
  if (location.pathname !== "/login") {
    location.href = "/login";
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Не пытаемся рефрешить, если: это не 401, конфига нет,
    // запрос уже повторяли, или 401 пришёл с самого /auth/login.
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      const newToken = await refreshTokens();
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original); // повторяем исходный запрос с новым токеном
    } catch (refreshError) {
      forceLogout();
      return Promise.reject(refreshError);
    }
  },
);
