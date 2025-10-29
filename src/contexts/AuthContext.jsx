// src\contexts\AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";
import { api } from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);

  useEffect(() => {
    // accessToken이 변경될 때마다 isAuthenticated 상태 동기화
    // localStorage에도 저장
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("accessToken");
      setIsAuthenticated(false);
    }
  }, [accessToken]);

  // 1. 자체 로그인
  const login = async (email, password) => {
    try {
      const response = await api.post("/users/login", { email, password });
      const { accessToken } = response.data;
      setAccessToken(accessToken);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // 컴포넌트에서 에러를 처리할 수 있도록 throw
    }
  };

  // 2. 회원가입
  const signup = async (email, password, passwordConfirm) => {
    try {
      await api.post("/users/signup", { email, password, passwordConfirm });
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  // 3. 로그아웃
  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // API 요청 성공 여부와 관계없이 프론트엔드 상태는 초기화
      setAccessToken(null);
    }
  };
  
  // 4. 소셜 로그인 콜백 처리 (AuthCallback 컴포넌트에서 사용)
  const handleSocialLogin = (token) => {
    setAccessToken(token);
  };

  const value = {
    isAuthenticated,
    accessToken,
    login,
    signup,
    logout,
    handleSocialLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;