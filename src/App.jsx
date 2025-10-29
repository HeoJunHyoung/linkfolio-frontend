// ./App.jsx

import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import AuthCallback from "./components/AuthCallback"; // 소셜 로그인 콜백

// 예시 대시보드
const Dashboard = () => {
  const { logout } = useAuth();
  return (
    <div>
      <h1>로그인 성공! (대시보드)</h1>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
};

// 인증된 사용자만 접근 가능
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// 로그인한 사용자는 접근 불가 (예: 로그인, 회원가입 페이지)
const PublicOnlyRoute = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { path: "", element: <Dashboard /> },
      // ... 기타 보호된 페이지
    ],
  },
  {
    path: "/",
    element: <PublicOnlyRoute />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      {
        path: "auth/callback", // (중요) 소셜 로그인 콜백 경로
        element: <AuthCallback />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;