// src/App.jsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Pages
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import FindUsernamePage from "./pages/FindUsernamePage"; // 아이디 찾기
import PasswordResetRequestPage from "./pages/PasswordReset/RequestPage"; // 비번 재설정 1
import PasswordResetVerifyPage from "./pages/PasswordReset/VerifyPage";   // 비번 재설정 2
import PasswordResetChangePage from "./pages/PasswordReset/ChangePage";   // 비번 재설정 3
import AuthCallback from "./components/AuthCallback"; // 소셜 로그인 콜백
import Dashboard from "./pages/Dashboard"; // 예시 대시보드 (pages 폴더로 이동)

// --- 라우트 가드 ---
// 인증된 사용자만 접근 가능
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  // 여기서 로딩 상태 등을 추가하여 초기 로딩 시 리다이렉트 방지 가능
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// 로그인/가입 등 인증 불필요 + 로그인 시 접근 불가 페이지
const PublicOnlyRoute = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

// 비밀번호 재설정 등 인증 불필요 페이지 (로그인 시 접근 가능해도 무방)
const PublicRoute = () => {
    return <Outlet />;
}

// --- 라우터 설정 ---
const router = createBrowserRouter([
  // 인증이 필요한 경로들
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { path: "", element: <Dashboard /> },
      // ... 다른 보호된 라우트들
    ],
  },
  // 로그인한 사용자는 접근할 수 없는 경로들
  {
    path: "/",
    element: <PublicOnlyRoute />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      { path: "auth/callback", element: <AuthCallback /> }, // 소셜 로그인 콜백
    ],
  },
  // 인증이 필요 없는 경로들 (로그인 사용자도 접근 가능)
  {
      path: "/",
      element: <PublicRoute />,
      children: [
          { path: "find-username", element: <FindUsernamePage /> },
          { path: "password-reset/request", element: <PasswordResetRequestPage /> },
          { path: "password-reset/verify", element: <PasswordResetVerifyPage /> },
          { path: "password-reset/change", element: <PasswordResetChangePage /> },
      ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;