// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
// import '../components/AuthForm.css'; // 스타일 필요 시 추가

// 게이트웨이 공용 주소 (환경변수 사용 추천)
const API_GATEWAY_URL = "http://linkfolio.127.0.0.1.nip.io";

const LoginPage = () => {
  const [username, setUsername] = useState(""); // email -> username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth(); // loading 상태 가져오기
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password); // email -> username
      navigate("/"); // 로그인 성공 시 대시보드로 이동
    } catch (err) {
      setError(
        err.response?.data?.message || "로그인 실패. 아이디와 비밀번호를 확인하세요."
      );
    }
  };

  // 소셜 로그인 링크
  const googleLoginUrl = `${API_GATEWAY_URL}/user-service/oauth2/authorization/google`;
  const naverLoginUrl = `${API_GATEWAY_URL}/user-service/oauth2/authorization/naver`;
  const kakaoLoginUrl = `${API_GATEWAY_URL}/user-service/oauth2/authorization/kakao`;

  return (
    <div className="auth-container"> {/* 스타일 클래스 적용 */}
      <h2>로그인</h2>

      <form onSubmit={handleSubmit} className="auth-form"> {/* 스타일 클래스 적용 */}
        <div className="form-group">
          <label htmlFor="login-username">아이디</label> {/* email -> username */}
          <input
            type="text" // email -> text
            id="login-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">비밀번호</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="auth-links">
        <Link to="/find-username">아이디 찾기</Link> |{' '}
        <Link to="/password-reset/request">비밀번호 재설정</Link> |{' '}
        <Link to="/signup">회원가입</Link>
      </div>

      <hr />
      <h3>소셜 로그인</h3>
      <div className="social-login-buttons">
        <a href={googleLoginUrl}>
          <button>Google</button> {/* 간단하게 변경 */}
        </a>
        <a href={naverLoginUrl}>
          <button>Naver</button>
        </a>
        <a href={kakaoLoginUrl}>
          <button>Kakao</button>
        </a>
      </div>
    </div>
  );
};

export default LoginPage;