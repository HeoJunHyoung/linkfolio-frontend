// src\components\LoginPage.jsx

import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

// 게이트웨이 공용 주소
const API_GATEWAY_URL = "http://linkfolio.127.0.0.1.nip.io";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/"); // 로그인 성공 시 대시보드로 이동
    } catch (err) {
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.");
    }
  };
  
  // 소셜 로그인 링크
  const googleLoginUrl = `${API_GATEWAY_URL}/user-service/oauth2/authorization/google`;
  const naverLoginUrl = `${API_GATEWAY_URL}/user-service/oauth2/authorization/naver`;
  const kakaoLoginUrl = `${API_GATEWAY_URL}/user-service/oauth2/authorization/kakao`;

  return (
    <div>
      <h2>로그인</h2>
      
      {/* --- 로그인 입력 폼 --- */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        <div>
          <label htmlFor="login-email" style={{ display: 'block', marginBottom: '5px' }}>이메일</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label htmlFor="login-password" style={{ display: 'block', marginBottom: '5px' }}>비밀번호</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit">로그인</button>
      </form>
      {/* --- 폼 종료 --- */}

      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>

      <hr />
      <h3>소셜 로그인</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        <a href={googleLoginUrl}>
          <button>Google로 로그인</button>
        </a>
        <a href={naverLoginUrl}>
          <button>Naver로 로그인</button>
        </a>
        <a href={kakaoLoginUrl}>
          <button>Kakao로 로그인</button>
        </a>
      </div>
    </div>
  );
};

export default LoginPage;