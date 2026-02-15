import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Login.css';

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Llamar al backend para autenticar
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        // Guardar el token JWT en localStorage
        localStorage.setItem('token', response.data.token);
        
        // Guardar información del usuario
        const user = response.data.user;
        setIsAuthenticated(true);
        setUserRole(user.role);
        
        // Opcional: guardar más datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirigir al usuario
        navigate('/estudio-teorico');
      }
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">✈</span>
          <h1>GreenAviation</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div style={{ 
              padding: '12px', 
              background: '#fee', 
              color: '#c33', 
              borderRadius: '6px', 
              fontSize: '14px' 
            }}>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="btn-login-submit"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        <div className="login-footer">
          <p>¿Olvidaste tu contraseña?</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

