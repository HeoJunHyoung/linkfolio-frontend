// src/pages/SignUpPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
// import '../components/AuthForm.css'; // 스타일 필요 시 추가

const SignUpPage = () => {
  // 상태 분리: 이메일 인증 단계, 상세 정보 입력 단계
  const [step, setStep] = useState(1); // 1: Email Input, 2: Code Input, 3: Details Input
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 완료 여부

  // 상세 정보 상태
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState(""); // YYYY-MM-DD 형식 가정
  const [gender, setGender] = useState(""); // MALE or FEMALE

  // UI 피드백 및 에러 처리
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null); // null: 확인 안함, true: 사용 가능, false: 중복
  const { sendVerificationCode, checkVerificationCode, signup, checkUsername, loading } = useAuth();
  const navigate = useNavigate();

  // --- 이메일 인증 관련 함수 ---
  const handleSendCode = async () => {
    setError("");
    setMessage("");
    if (!email) {
      setError("이메일을 입력하세요.");
      return;
    }
    try {
      await sendVerificationCode(email);
      setMessage("인증 코드가 발송되었습니다. 이메일을 확인하세요.");
      setStep(2); // 다음 단계로
    } catch (err) {
      setError(err.response?.data?.message || "인증 코드 발송에 실패했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setMessage("");
    if (!code) {
      setError("인증 코드를 입력하세요.");
      return;
    }
    try {
      await checkVerificationCode(email, code);
      setIsEmailVerified(true);
      setMessage("이메일 인증이 완료되었습니다. 추가 정보를 입력하세요.");
      setStep(3); // 다음 단계로
    } catch (err) {
      setError(err.response?.data?.message || "인증 코드 확인에 실패했습니다.");
    }
  };

  // --- 아이디 중복 확인 함수 ---
  // Debounce 적용 추천 (입력 멈춘 후 잠시 뒤 실행)
  const handleCheckUsername = async (inputUsername) => {
    if (!inputUsername || inputUsername.length < 4) { // 예: 최소 4자 이상
      setIsUsernameAvailable(null);
      return;
    }
    try {
      const isAvailable = await checkUsername(inputUsername);
      setIsUsernameAvailable(isAvailable);
    } catch (err) {
      console.error("Username check failed:", err);
      setIsUsernameAvailable(null); // 확인 실패 시 초기 상태로
    }
  };
  // username 입력 시 호출
  useEffect(() => {
    const handler = setTimeout(() => {
        handleCheckUsername(username);
    }, 500); // 500ms 디바운스

    return () => {
        clearTimeout(handler);
    };
  }, [username]); // username 변경 시마다 디바운스 실행

  // --- 최종 회원가입 함수 ---
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isEmailVerified) {
      setError("이메일 인증을 먼저 완료해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isUsernameAvailable) {
        setError("사용할 수 없는 아이디입니다.");
        return;
    }
    if (!name || !birthdate || !gender) {
        setError("모든 필수 정보를 입력해주세요.");
        return;
    }

    const userData = { email, username, password, passwordConfirm, name, birthdate, gender };

    try {
      await signup(userData);
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="auth-container">
      <h2>회원가입</h2>

      {/* --- 단계 1: 이메일 입력 --- */}
      {step === 1 && (
        <div className="auth-form">
          <p>가입할 이메일 주소를 입력하고 인증 코드를 받으세요.</p>
          <div className="form-group">
            <label htmlFor="signup-email">이메일</label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <button onClick={handleSendCode} disabled={loading || !email}>
            {loading ? '전송 중...' : '인증 코드 받기'}
          </button>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      )}

      {/* --- 단계 2: 인증 코드 입력 --- */}
      {step === 2 && (
        <div className="auth-form">
          <p>{email}으로 전송된 인증 코드를 입력하세요.</p>
          <div className="form-group">
            <label htmlFor="signup-code">인증 코드</label>
            <input
              type="text"
              id="signup-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
            />
          </div>
          <button onClick={handleVerifyCode} disabled={loading || !code}>
            {loading ? '확인 중...' : '인증 코드 확인'}
          </button>
          <button onClick={() => setStep(1)} disabled={loading} style={{ marginLeft: '10px', backgroundColor: '#6c757d'}}>
            이메일 다시 입력
          </button>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      )}

      {/* --- 단계 3: 상세 정보 입력 --- */}
      {step === 3 && isEmailVerified && (
        <form onSubmit={handleSignUpSubmit} className="auth-form">
          <p>이메일 인증 완료: {email}</p>
          <div className="form-group">
            <label htmlFor="signup-username">아이디</label>
            <input
              type="text"
              id="signup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
             {isUsernameAvailable === true && <span style={{ color: 'green', fontSize: '0.9em' }}>사용 가능한 아이디입니다.</span>}
             {isUsernameAvailable === false && <span style={{ color: 'red', fontSize: '0.9em' }}>이미 사용 중인 아이디입니다.</span>}
          </div>
          <div className="form-group">
            <label htmlFor="signup-password">비밀번호</label>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-password-confirm">비밀번호 확인</label>
            <input
              type="password"
              id="signup-password-confirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            {password && passwordConfirm && password !== passwordConfirm && <span style={{ color: 'red', fontSize: '0.9em' }}>비밀번호가 일치하지 않습니다.</span>}
          </div>
          <div className="form-group">
            <label htmlFor="signup-name">이름 (실명)</label>
            <input
              type="text"
              id="signup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-birthdate">생년월일</label>
            <input
              type="date" // 날짜 선택 UI 사용
              id="signup-birthdate"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
              placeholder="YYYY-MM-DD"
            />
          </div>
           <div className="form-group">
            <label>성별</label>
            <div>
              <label style={{ marginRight: '15px' }}>
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={gender === "MALE"}
                  onChange={(e) => setGender(e.target.value)}
                  required
                /> 남성
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={gender === "FEMALE"}
                  onChange={(e) => setGender(e.target.value)}
                  required
                /> 여성
              </label>
            </div>
          </div>
          <button type="submit" disabled={loading || !isUsernameAvailable || password !== passwordConfirm}>
            {loading ? '가입 처리 중...' : '가입하기'}
          </button>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      <p style={{ marginTop: '20px' }}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
};

export default SignUpPage;