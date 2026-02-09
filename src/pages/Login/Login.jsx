import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Credenciales específicas
    const adminEmail = 'GreenAviation@gmail.com';
    const adminPassword = 'GreenAviation2026!';
    const alumnoEmail = 'AlumnoPrueba@gmail.com';
    const alumnoPassword = 'alumno123';
    
    if (email === adminEmail && password === adminPassword) {
      setIsAuthenticated(true);
      setUserRole('admin');
      navigate('/estudio-teorico');
    } else if (email === alumnoEmail && password === alumnoPassword) {
      setIsAuthenticated(true);
      setUserRole('alumno');
      navigate('/estudio-teorico');
    } else {
      alert('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
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
          <button type="submit" className="btn-login-submit">
            Iniciar Sesión
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

