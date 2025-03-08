import axios from "axios";
import CONFIG from "../config"; 

// Создаём инстанс
const api = axios.create({
  baseURL: `${CONFIG.SERVER_URL}`, // ваш URL
});

// Чтобы не запускать рефреш несколько раз параллельно
let isRefreshing = false;
// Очередь запросов, которые "застыли", пока рефреш идёт
let refreshSubscribers: Array<(token: string) => void> = [];

// Добавляем запрос в очередь
function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Как только рефреш-токен получен, оповещаем все "застывшие" запросы
function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

// Interceptor на запрос: подставляем accessToken
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor на ответ: если 401, пробуем рефреш
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Проверяем код 401
    if (error.response && error.response.status === 401) {
      // Проверяем, идёт ли уже процесс рефреша
      if (!isRefreshing) {
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // Рефреш-токена нет – сразу разлогиниваем
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          // Делаем запрос на сервер за новым токеном
          const response = await axios.post(`${CONFIG.SERVER_URL}/auth/refresh`, {
            refreshToken
          });
          const newAccessToken = response.data.accessToken;

          // Сохраняем новый accessToken
          localStorage.setItem("accessToken", newAccessToken);

          // Оповещаем все запросы, ждавшие refresh
          onRefreshed(newAccessToken);
        } catch (refreshError) {
          // Рефреш не удался – разлогиниваем
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Возвращаем промис, который выполнится, когда рефреш завершится,
      // и повторяем оригинальный запрос с новым токеном
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    // Если это не 401, или что-то другое – выбрасываем ошибку дальше
    return Promise.reject(error);
  }
);

export default api;
