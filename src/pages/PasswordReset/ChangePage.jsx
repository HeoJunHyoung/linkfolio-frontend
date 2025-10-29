// src/pages/PasswordReset/ChangePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
// import '../../components/AuthForm.css';

const ChangePage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { changePassword, loading } = useAuth();
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
        if (!email) return;

        if (newPassword !== passwordConfirm) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            await changePassword(email, newPassword, passwordConfirm);
            setMessage('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.');
            setTimeout(() => {
                navigate('/login');
            }, 2000); // 2초 후 로그인 페이지로 이동
        } catch (err) {
            setError(err.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="auth-container">
            <h2>비밀번호 재설정 (3/3)</h2>
            <p>새로운 비밀번호를 입력하세요.</p>
            <form onSubmit={handleSubmit} className="auth-form">
                 <div className="form-group">
                    <label htmlFor="new-password">새 비밀번호</label>
                    <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password">새 비밀번호 확인</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                     {newPassword && passwordConfirm && newPassword !== passwordConfirm && <span style={{ color: 'red', fontSize: '0.9em' }}>비밀번호가 일치하지 않습니다.</span>}
                </div>
                <button type="submit" disabled={loading || !newPassword || !passwordConfirm || newPassword !== passwordConfirm || !email}>
                    {loading ? '변경 중...' : '비밀번호 변경 완료'}
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

export default ChangePage;