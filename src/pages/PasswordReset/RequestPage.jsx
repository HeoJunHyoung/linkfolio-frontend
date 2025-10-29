// src/pages/PasswordReset/RequestPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
// import '../../components/AuthForm.css';

const RequestPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { sendPwResetCode, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await sendPwResetCode(email);
            setMessage('비밀번호 재설정 코드가 발송되었습니다. 이메일을 확인하세요.');
            // 성공 시, 이메일 주소를 state로 넘기면서 다음 단계로 이동
            navigate('/password-reset/verify', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || '코드 발송 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="auth-container">
            <h2>비밀번호 재설정 (1/3)</h2>
            <p>가입 시 사용한 이메일 주소를 입력하세요.</p>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="reset-email">이메일</label>
                    <input
                        type="email"
                        id="reset-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
                <button type="submit" disabled={loading || !email}>
                    {loading ? '전송 중...' : '인증 코드 받기'}
                </button>
            </form>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <p style={{ marginTop: '20px' }}>
                <Link to="/login">로그인 페이지로 돌아가기</Link>
            </p>
        </div>
    );
};

export default RequestPage;