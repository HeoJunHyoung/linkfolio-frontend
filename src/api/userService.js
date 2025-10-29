// src/api/userService.js
import { api } from "./axiosInstance";

// 회원가입 1: 인증코드 발송
export const sendVerificationCode = (email) => {
  return api.post("/users/email-verification/send", { email });
};

// 회원가입 2: 인증코드 확인
export const checkVerificationCode = (email, code) => {
  return api.post("/users/email-verification/check", { email, code });
};

// 회원가입 3: 최종 가입 요청
export const signUpUser = (userData) => {
  // userData: { email, username, password, passwordConfirm, name, birthdate, gender }
  return api.post("/users/signup", userData);
};

// 아이디 중복 확인
export const checkUsernameAvailability = (username) => {
  return api.post("/users/check-username", { username });
};

// 로그인
export const loginUser = (username, password) => {
  return api.post("/users/login", { username, password });
};

// 로그아웃
export const logoutUser = () => {
  return api.post("/users/logout");
};

// 아이디 찾기
export const findUserUsername = (name, email) => {
  return api.post("/users/find-username", { name, email });
};

// 비밀번호 재설정 1: 코드 발송
export const sendPasswordResetCode = (email) => {
  return api.post("/users/password-reset/send-code", { email });
};

// 비밀번호 재설정 2: 코드 검증
export const verifyPasswordResetCode = (email, code) => {
  return api.post("/users/password-reset/verify-code", { email, code });
};

// 비밀번호 재설정 3: 비밀번호 변경
export const resetUserPassword = (email, newPassword, passwordConfirm) => {
  return api.post("/users/password-reset/change", { email, newPassword, passwordConfirm });
};

// 내 정보 조회 (예시)
export const getMyInfo = () => {
  return api.get("/users/me");
};