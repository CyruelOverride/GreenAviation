import React, { useState, useEffect } from 'react';
import { authAPI, flightAPI } from '../../services/api';
import './MiPerfil.css';

const MiPerfil = ({ isAuthenticated, userRole }) => {
  const [user, setUser] = useState(null);
  const [flights, setFlights] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('perfil');

  useEffect(() => {
    if (isAuthenticated && userRole === 'alumno') {
      fetchUserData();
    }
  }, [isAuthenticated, userRole]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos del usuario
      const userResponse = await authAPI.getMe();
      if (userResponse.success && userResponse.data.user) {
        const userData = userResponse.data.user;
        setUser(userData);
        
        // Obtener calificaciones del usuario
        if (userData.calificaciones) {
          setCalificaciones(userData.calificaciones);
        }
      }

      // Obtener vuelos del usuario
      const flightsResponse = await flightAPI.getAll();
      if (flightsResponse.success && flightsResponse.data.flights) {
        setFlights(flightsResponse.data.flights);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || userRole !== 'alumno') {
    return (
      <div className="mi-perfil-container">
        <div className="error-message">
          <p>Debes iniciar sesión como alumno para ver tu perfil.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mi-perfil-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mi-perfil-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const calcularPromedio = (calificaciones) => {
    if (!calificaciones || calificaciones.length === 0) return 0;
    const suma = calificaciones.reduce((acc, cal) => acc + (cal.calificacion || 0), 0);
    return Math.round(suma / calificaciones.length);
  };

  const totalHorasVuelo = flights.reduce((total, flight) => {
    return total + (flight.horasVuelo?.cantidad || 0);
  }, 0);

  return (
    <div className="mi-perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <p>Bienvenido, {user?.nombreCompleto || user?.nombre || 'Alumno'}</p>
      </div>

      <div className="perfil-tabs">
        <button 
          className={`tab ${activeTab === 'perfil' ? 'active' : ''}`}
          onClick={() => setActiveTab('perfil')}
        >
          Información Personal
        </button>
        <button 
          className={`tab ${activeTab === 'calificaciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('calificaciones')}
        >
          Calificaciones
        </button>
        <button 
          className={`tab ${activeTab === 'vuelos' ? 'active' : ''}`}
          onClick={() => setActiveTab('vuelos')}
        >
          Mis Vuelos
        </button>
      </div>

      <div className="perfil-content">
        {activeTab === 'perfil' && (
          <div className="perfil-section">
            <div className="info-card">
              <h2>Información Personal</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Nombre Completo</label>
                  <p>{user?.nombreCompleto || `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{user?.email || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Cédula</label>
                  <p>{user?.cedula || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Teléfono</label>
                  <p>{user?.numeroTelefono || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Edad</label>
                  <p>{user?.edad || 'N/A'} años</p>
                </div>
                <div className="info-item">
                  <label>Estado del Curso</label>
                  <p className={`estado-badge ${user?.estado?.toLowerCase()}`}>
                    {user?.estado || 'N/A'}
                  </p>
                </div>
                <div className="info-item">
                  <label>Progreso</label>
                  <div className="progreso-container">
                    <div className="progreso-bar">
                      <div 
                        className="progreso-fill" 
                        style={{ width: `${user?.progreso || 0}%` }}
                      ></div>
                    </div>
                    <span className="progreso-text">{user?.progreso || 0}%</span>
                  </div>
                </div>
                <div className="info-item">
                  <label>Fecha de Inicio</label>
                  <p>{user?.fechaInicioCurso ? new Date(user.fechaInicioCurso).toLocaleDateString('es-ES') : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <h2>Estadísticas</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{calificaciones.length}</div>
                  <div className="stat-label">Calificaciones</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{calcularPromedio(calificaciones)}</div>
                  <div className="stat-label">Promedio</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{flights.length}</div>
                  <div className="stat-label">Vuelos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{totalHorasVuelo.toFixed(1)}</div>
                  <div className="stat-label">Horas de Vuelo</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calificaciones' && (
          <div className="perfil-section">
            <div className="calificaciones-card">
              <h2>Mis Calificaciones</h2>
              {calificaciones.length === 0 ? (
                <p className="empty-message">No tienes calificaciones registradas aún.</p>
              ) : (
                <>
                  <div className="promedio-header">
                    <span>Promedio General: </span>
                    <strong>{calcularPromedio(calificaciones)}%</strong>
                  </div>
                  <div className="calificaciones-list">
                    {calificaciones.map((cal, index) => (
                      <div key={index} className="calificacion-item">
                        <div className="calificacion-header">
                          <h3>{cal.tipo || 'Calificación'}</h3>
                          <span className={`calificacion-badge ${cal.calificacion >= 70 ? 'aprobado' : 'reprobado'}`}>
                            {cal.calificacion}%
                          </span>
                        </div>
                        <div className="calificacion-details">
                          <p><strong>Fecha:</strong> {cal.fecha ? new Date(cal.fecha).toLocaleDateString('es-ES') : 'N/A'}</p>
                          {cal.observaciones && (
                            <p><strong>Observaciones:</strong> {cal.observaciones}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vuelos' && (
          <div className="perfil-section">
            <div className="vuelos-card">
              <h2>Mis Vuelos</h2>
              {flights.length === 0 ? (
                <p className="empty-message">No tienes vuelos registrados aún.</p>
              ) : (
                <div className="vuelos-list">
                  {flights.map((flight) => (
                    <div key={flight.id} className="vuelo-item">
                      <div className="vuelo-header">
                        <div>
                          <h3>Vuelo del {flight.fecha ? new Date(flight.fecha).toLocaleDateString('es-ES') : 'N/A'}</h3>
                          <p className="vuelo-tipo">{flight.tipoVuelo || 'N/A'}</p>
                        </div>
                        <div className="vuelo-calificacion">
                          <span className={`calificacion-badge ${flight.calificacion >= 70 ? 'aprobado' : 'reprobado'}`}>
                            {flight.calificacion}%
                          </span>
                        </div>
                      </div>
                      <div className="vuelo-details">
                        <div className="vuelo-detail-item">
                          <strong>Duración:</strong> {flight.duracion || 0} minutos
                        </div>
                        {flight.horasVuelo?.cantidad && (
                          <div className="vuelo-detail-item">
                            <strong>Horas de Vuelo:</strong> {flight.horasVuelo.cantidad} ({flight.horasVuelo.tipo})
                          </div>
                        )}
                        {flight.aeronave?.tipo && (
                          <div className="vuelo-detail-item">
                            <strong>Aeronave:</strong> {flight.aeronave.tipo} {flight.aeronave.matricula ? `(${flight.aeronave.matricula})` : ''}
                          </div>
                        )}
                        {flight.observaciones && (
                          <div className="vuelo-detail-item">
                            <strong>Observaciones:</strong> {flight.observaciones}
                          </div>
                        )}
                        {flight.maniobras && flight.maniobras.length > 0 && (
                          <div className="maniobras-section">
                            <strong>Maniobras:</strong>
                            <ul className="maniobras-list">
                              {flight.maniobras.map((maniobra, idx) => (
                                <li key={idx}>
                                  {maniobra.nombre}
                                  {maniobra.calificacion && (
                                    <span className="maniobra-calificacion"> - {maniobra.calificacion}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiPerfil;

