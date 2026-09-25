import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TẠM THỜI: Mock login để test UI trước khi nối Backend JWT
      // Sau này sẽ thay bằng fetch('/api/auth/login')
      setTimeout(() => {
        if (username === 'admin' && password === '123456') {
          // Fake token
          const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake";
          localStorage.setItem('token', fakeToken);
          onLoginSuccess(fakeToken);
        } else {
          setError('Tài khoản hoặc mật khẩu không đúng! (Gợi ý: admin / 123456)');
        }
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-panel">
        <h2 className="login-title">Chào mừng trở lại</h2>
        <p className="login-subtitle">Đăng nhập để sử dụng AI Chatbot</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Tên đăng nhập</label>
            <input
              type="text"
              className="glass-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tài khoản của bạn"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mật khẩu</label>
            <input
              type="password"
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="glow-button" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
