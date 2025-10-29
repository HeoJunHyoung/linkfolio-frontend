// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import * as userService from "../api/userService"; // userService import

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  // accessToken 변경 시 localStorage 동기화 및 isAuthenticated 상태 업데이트
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      // axios 인스턴스의 기본 헤더 설정 (페이지 새로고침 시 필요)
      userService.api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("accessToken");
      delete userService.api.defaults.headers.common["Authorization"];
      setIsAuthenticated(false);
    }
  }, [accessToken]);

  // 로그인 함수 (username 사용)
  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const response = await userService.loginUser(username, password);
      const { accessToken: receivedToken } = response.data; // 이름 충돌 방지
      setAccessToken(receivedToken);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
      throw error;
    }
  }, []);

  // 로그아웃 함수
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // 서버에 로그아웃 요청 (Refresh Token 삭제 목적)
      await userService.logoutUser();
    } catch (error) {
      // 서버 요청 실패해도 프론트에서는 로그아웃 처리
      console.error("Logout request failed:", error);
    } finally {
      setAccessToken(null); // Access Token 상태 및 localStorage 제거
      setLoading(false);
    }
  }, []);

  // 소셜 로그인 콜백 처리
  const handleSocialLogin = useCallback((token) => {
    setAccessToken(token);
  }, []);

  // --- API 호출 함수들 (userService 사용) ---
  const sendVerificationCode = useCallback(async (email) => {
      setLoading(true);
      try {
          await userService.sendVerificationCode(email);
          setLoading(false);
      } catch (error) {
          setLoading(false);
          throw error;
      }
  }, []);

  const checkVerificationCode = useCallback(async (email, code) => {
      setLoading(true);
      try {
          await userService.checkVerificationCode(email, code);
          setLoading(false);
      } catch (error) {
          setLoading(false);
          throw error;
      }
  }, []);

  const signup = useCallback(async (userData) => {
      setLoading(true);
      try {
          await userService.signUpUser(userData);
          setLoading(false);
      } catch (error) {
          setLoading(false);
          throw error;
      }
  }, []);

  const checkUsername = useCallback(async (username) => {
      // 이 함수는 성공/실패 여부만 중요하므로 간단히 처리
      try {
          await userService.checkUsernameAvailability(username);
          return true; // 사용 가능
      } catch (error) {
          if (error.response && error.response.status === 409) {
              return false; // 중복됨
          }
          throw error; // 그 외 에러
      }
  }, []);

  const findUsername = useCallback(async (name, email) => {
      setLoading(true);
      try {
          const response = await userService.findUserUsername(name, email);
          setLoading(false);
          return response.data; // username 문자열 반환
      } catch (error) {
          setLoading(false);
          throw error;
      }
  }, []);

  const sendPwResetCode = useCallback(async (email) => {
      setLoading(true);
      try {
          await userService.sendPasswordResetCode(email);
          setLoading(false);
      } catch (error) {
          setLoading(false);
          throw error;
      }
  }, []);

  const verifyPwResetCode = useCallback(async (email, code) => {
      setLoading(true);
      try {
          await userService.verifyPasswordResetCode(email, code);
          setLoading(false);
      } catch (error) {
          setLoading(false);
          throw error;
      }
  }, []);

  const changePassword = useCallback(async (email, newPassword, passwordConfirm) => {
      setLoading(true);
      try {
          await userService.resetUserPassword(email, newPassword, passwordConfirm);
          setLoading(false);
      } catch (error) {
          setLoading(false);
          throw error;
      }
  }, []);

  const value = {
    isAuthenticated,
    accessToken,
    loading, // 로딩 상태 제공
    login,
    logout,
    handleSocialLogin,
    // 회원가입 관련
    sendVerificationCode,
    checkVerificationCode,
    signup,
    checkUsername,
    // 아이디/비번 찾기 관련
    findUsername,
    sendPwResetCode,
    verifyPwResetCode,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;