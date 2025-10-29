// src\api\axiosInstance.js

import axios from "axios";

// 백엔드 API 게이트웨이 주소 (application.yml 참조)
// 여기서는 API Gateway가 localhost:8000이라고 가정합니다.
const BASE_URL = "http://linkfolio.127.0.0.1.nip.io/user-service";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // (중요) 쿠키(Refresh Token) 전송을 위함
});

// --- 1. 요청 인터셉터 ---
// 요청을 보내기 전에 Access Token을 헤더에 추가합니다.
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 2. 응답 인터셉터 ---
// Access Token 만료(401) 시, Refresh Token으로 재발급 시도
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

    // 401 에러이고, 토큰 재발급 요청이 아니었다면
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 재발급 중이면, 큐에 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers["Authorization"] = "Bearer " + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // (중요) /users/refresh 엔드포인트 호출
        const rs = await api.post("/users/refresh");
        
        const { accessToken } = rs.data;
        localStorage.setItem("accessToken", accessToken);

        // 새로 받은 Access Token으로 원래 요청 재시도
        api.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;
        
        processQueue(null, accessToken); // 대기 중인 큐 실행
        isRefreshing = false;
        
        return api(originalRequest);

      } catch (refreshError) {
        // 리프레시 실패 시 (예: 리프레시 토큰 만료)
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // (중요) 로그인 페이지로 리디렉션
        window.location.href = "/login"; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);