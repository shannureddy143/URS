import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.phone, formData.password);
      }
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Mock Google login for now
      const mockGoogleUser = {
        email: 'user@gmail.com',
        name: 'Google User'
      };
      
      const result = await fetch('http://localhost:5000/api/auth/google-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockGoogleUser)
      });
      
      const data = await result.json();
      
      if (result.ok) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
        window.location.reload();
      } else {
        alert(data.message || 'Google login failed');
      }
    } catch (error) {
      alert('Google login failed');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: '800' }}>
            ☂️ RainShield
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '300' }}>
            Hey there! Ready to stay dry? 🌧️
          </p>
          <div style={{
            width: '60px',
            height: '4px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin: '16px auto',
            borderRadius: '2px'
          }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="input"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          {!isLogin && (
            <input
              type="tel"
              placeholder="Phone Number"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          )}
          
          <input
            type="password"
            placeholder="Password"
            className="input"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Just a sec...' : (isLogin ? 'Let me in!' : 'Join the club!')}
          </button>
        </form>

        <div style={{ margin: '20px 0', textAlign: 'center', color: '#6b7280' }}>OR</div>

        <button 
          onClick={handleGoogleLogin}
          className="btn"
          style={{ 
            width: '100%', 
            background: 'linear-gradient(135deg, #db4437 0%, #c23321 100%)', 
            color: 'white', 
            marginBottom: '20px',
            boxShadow: '0 8px 20px rgba(219, 68, 55, 0.3)'
          }}
        >
          Continue with Google
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer' }}
          >
            {isLogin ? "New here? Join us!" : "Already a member? Welcome back!"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;