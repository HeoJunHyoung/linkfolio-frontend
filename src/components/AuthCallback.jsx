// src\components\AuthCallback.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleSocialLogin } = useAuth();

  useEffect(() => {
    // (중요) URL 쿼리 파라미터에서 "token"을 추출합니다.
    const accessToken = searchParams.get("token");

    if (accessToken) {
      // Context에 Access Token 저장
      handleSocialLogin(accessToken);
      // 토큰을 URL에서 제거하고 메인 페이지로 이동
      navigate("/", { replace: true });
    } else {
      // 토큰이 없는 비정상적인 접근
      alert("로그인 처리에 실패했습니다. 다시 시도해주세요.");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, handleSocialLogin]);

  // 로딩 중 표시
  return <div>로그인 처리 중입니다...</div>;
};

export default AuthCallback;