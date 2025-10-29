// src/pages/PasswordReset/VerifyPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
// import '../../components/AuthForm.css';

const VerifyPage = () => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { verifyPwResetCode, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // 이전 페이지에서 넘겨받은 email

    // email 정보 없이 접근 시 request 페이지로 리다이렉트
    useEffect(() => {
        if (!email) {
            alert('잘못된 접근입니다. 이메일 입력 단계부터 다시 진행해주세요.');
            navigate('/password-reset/request', { replace: true });
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!email) return; // email 없으면 진행 불가

        try {
            await verifyPwResetCode(email, code);
            setMessage('인증 코드가 확인되었습니다. 새 비밀번호를 입력하세요.');
            // 성공 시, email 주소를 state로 넘기면서 다음 단계로 이동
            navigate('/password-reset/change', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || '인증 코드 확인 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="auth-container">
            <h2>비밀번호 재설정 (2/3)</h2>
            <p>{email ? `${email}으로` : '이메일로'} 전송된 인증 코드를 입력하세요.</p>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="reset-code">인증 코드</label>
                    <input
                        type="text"
                        id="reset-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        maxLength={6}
                    />
                </div>
                <button type="submit" disabled={loading || !code || !email}>
                    {loading ? '확인 중...' : '인증 코드 확인'}
                </button>
            </form>

             <button
                onClick={() => navigate('/password-reset/request', { replace: true })}
                disabled={loading}
                style={{ marginTop: '10px', backgroundColor: '#6c757d'}}
            >
                이메일 다시 입력
            </button>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

             <p style={{ marginTop: '20px' }}>
                <Link to="/login">로그인 페이지로 돌아가기</Link>
            </p>
        </div>
    );
};

export default VerifyPage;