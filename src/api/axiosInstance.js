// src/api/axiosInstance.js
import axios from "axios";

// 백엔드 API 게이트웨이 주소
const API_GATEWAY_URL = "http://linkfolio.127.0.0.1.nip.io"; // <- 환경변수 등으로 관리 추천
const BASE_URL = `${API_GATEWAY_URL}/user-service`; // user-service 경로 추가

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 쿠키 전송 허용
});

// --- 요청 인터셉터 (Access Token 추가) ---
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && !config.headers["Authorization"]) { // 헤더 없을 때만 추가
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 응답 인터셉터 (Token Refresh) ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 토큰 재발급 요청이 아니며(_retry 플래그), /users/refresh 경로가 아니어야 함
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/users/refresh') {
      if (isRefreshing) {
        // 이미 재발급 중이면 큐에 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers["Authorization"] = "Bearer " + token;
          return api(originalRequest); // 수정: axios 대신 api 사용
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 리프레시 토큰으로 새 Access Token 요청 (/users/refresh)
        const rs = await api.post("/users/refresh"); // 쿠키에 담긴 리프레시 토큰 사용
        const { accessToken } = rs.data;

        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common["Authorization"] = "Bearer " + accessToken; // 기본 헤더 업데이트

        // 실패했던 요청 및 큐에 있던 요청들 재시도
        processQueue(null, accessToken);
        originalRequest.headers["Authorization"] = "Bearer " + accessToken; // 현재 실패한 요청 헤더 업데이트
        return api(originalRequest); // 수정: axios 대신 api 사용

      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken"); // 토큰 삭제
        processQueue(refreshError, null);

        // (중요) 로그인 페이지로 강제 이동
        // AuthContext가 없으므로 직접 처리
        if (window.location.pathname !== '/login') {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
          isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);