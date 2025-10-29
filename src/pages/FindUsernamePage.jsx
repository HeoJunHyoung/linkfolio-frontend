// src/pages/FindUsernamePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
// import '../components/AuthForm.css'; // 스타일 필요 시 추가

const FindUsernamePage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [foundUsername, setFoundUsername] = useState(null);
    const [error, setError] = useState('');
    const { findUsername, loading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFoundUsername(null);
        try {
            const username = await findUsername(name, email);
            setFoundUsername(username);
        } catch (err) {
            setError(err.response?.data?.message || '아이디를 찾는 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="auth-container">
            <h2>아이디 찾기</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="find-name">이름 (실명)</label>
                    <input
                        type="text"
                        id="find-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="find-email">이메일</label>
                    <input
                        type="email"
                        id="find-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? '찾는 중...' : '아이디 찾기'}
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}
            {foundUsername && (
                <div className="success-message" style={{ marginTop: '20px' }}>
                    <p>회원님의 아이디는 <strong>{foundUsername}</strong> 입니다.</p>
                    <Link to="/login">로그인 하러 가기</Link>
                </div>
            )}

            <p style={{ marginTop: '20px' }}>
                <Link to="/login">로그인 페이지로 돌아가기</Link>
            </p>
        </div>
    );
};

export default FindUsernamePage;