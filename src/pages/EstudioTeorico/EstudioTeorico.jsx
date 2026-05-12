import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI, recursoAPI } from '../../services/api';
import './EstudioTeorico.css';

// Los videos se desbloquean en orden: el video 1 siempre está disponible;
// para ver el video N (N>1) debes haber completado el video N-1.

const EstudioTeorico = ({ isAuthenticated, userRole }) => {
  const [progress, setProgress] = useState(0);
  const [videosVistos, setVideosVistos] = useState({});
  const [examenesPorCapitulo, setExamenesPorCapitulo] = useState({});
  const [videosDelCurso, setVideosDelCurso] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);

  // Cargar lista de videos (recursos) y progreso del alumno
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setVideosDelCurso([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const videosRes = await recursoAPI.getVideosTeorico();

        if (videosRes.success && videosRes.data?.recursos?.length) {
          const mapped = [...videosRes.data.recursos]
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
            .map((r) => ({
              numero: Number(r.orden),
              titulo: r.nombre,
              driveLink: r.rutaOUrl,
            }));
          setVideosDelCurso(mapped);
        } else {
          setVideosDelCurso([]);
          setError('No hay videos del curso configurados. Ejecutá la migración de base de datos o contactá al administrador.');
        }
      } catch (err) {
        console.error('Error al cargar videos del curso:', err);
        setError(err.message || 'Error al cargar la lista de videos');
        setVideosDelCurso([]);
      }

      try {
        const progressRes = await videoAPI.getProgress();
        if (progressRes.success) {
          setVideosVistos(progressRes.data.videosVistos || {});
          setExamenesPorCapitulo(progressRes.data.examenesPorCapitulo || {});
          const progresoReal = userRole === 'admin' ? 100 : (progressRes.data.progreso ?? 0);
          setProgress(progresoReal);
        } else {
          setError((prev) => prev || 'Error al cargar el progreso de videos');
        }
      } catch (err) {
        console.error('Error al cargar progreso:', err);
        setError((prev) => prev || 'Error al cargar el progreso de videos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userRole]);

  // Polling periódico de progreso mientras haya videos "En progreso"
  useEffect(() => {
    if (!isAuthenticated || userRole === 'admin') {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const hayEnProgreso = Object.values(videosVistos).some(
      (v) => v && v.completado === false
    );

    if (!hayEnProgreso) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await videoAPI.getProgress();
          if (response.success) {
            setVideosVistos(response.data.videosVistos || {});
            setExamenesPorCapitulo(response.data.examenesPorCapitulo || {});
            const progresoReal = userRole === 'admin' ? 100 : (response.data.progreso ?? 0);
            setProgress(progresoReal);
          }
        } catch (err) {
          console.error('Error al actualizar progreso (polling):', err);
        }
      }, 4 * 60 * 1000); // cada 4 minutos
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, userRole, videosVistos]);

  // Verificar si un video está desbloqueado: solo se requiere haber completado el video anterior
  const isVideoDesbloqueado = (videoNumero) => {
    if (userRole === 'admin') return true;
    if (videoNumero === 1) return true;
    const videoAnterior = videoNumero - 1;
    return videosVistos[videoAnterior]?.completado === true;
  };

  // Mensaje cuando el video está bloqueado
  const getMensajeBloqueo = (videoNumero) => {
    if (videoNumero === 1) return null;
    const videoAnterior = videoNumero - 1;
    if (videosVistos[videoAnterior]?.completado) return null;
    return `Completa el video ${videoAnterior} para desbloquear este video`;
  };

  // Manejar clic en ver video
  const handleVerVideo = async (video) => {
    if (!isVideoDesbloqueado(video.numero)) return;

    try {
      // Registrar que el usuario empezó a ver el video
      await videoAPI.startVideo(video.numero);
      
      // Actualizar estado local
      setVideosVistos(prev => ({
        ...prev,
        [video.numero]: {
          startedAt: new Date().toISOString(),
          completado: false
        }
      }));
      
      // Abrir el video en una nueva pestaña
      window.open(video.driveLink, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error al registrar video:', err);
      // Aún así abrir el video
      window.open(video.driveLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="estudio-teorico">
        <h1 className="page-title">Estudio Teórico</h1>
        <div className="info-card-unauthenticated">
          <h2>📚 Contenido del Curso</h2>
          <p>En esta sección encontrarás:</p>
          <ul>
            <li>Manual de Piloto Privado en formato digital</li>
            <li>Videos del curso organizados por capítulos</li>
            <li>Material integrado con Google Drive</li>
            <li>Seguimiento de tu progreso académico</li>
          </ul>
          <p className="auth-prompt">Inicia sesión para acceder al contenido completo</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="estudio-teorico">
      <h1 className="page-title">Estudio Teórico</h1>
      
      <div className="progress-section">
        <div className="progress-header">
          <h2>Tu Progreso</h2>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="content-section">
        <div className="manual-section">
          <h2>Manual de Piloto</h2>
          <div className="manual-card">
            <div className="manual-icon">
              <img 
                src="/Imagenes/Logo manual aviacion.jpeg" 
                alt="Logo Manual Piloto Privado"
                className="manual-logo"
              />
            </div>
            <div className="manual-info">
              <h3>Manual de Piloto Privado</h3>
              <p>Accede al manual completo en formato digital</p>
            </div>
            <div className="manual-button-container">
              <a 
                href="https://drive.google.com/file/d/1BDPoFDrIyYaHdfkrGvaw3CswKjCXeHjd/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Ver Manual en Google Drive
              </a>
            </div>
          </div>
        </div>

        {/* Sección de Videos del Curso */}
        <div className="videos-curso-section">
          <h2>📹 Videos del Curso Teórico</h2>
          <p className="videos-descripcion">
            Completa cada video en orden para avanzar. Cada video se desbloquea al completar el anterior. Luego de ver los tres videos de un capítulo, podrás realizar el examen de ese capítulo en la sección Exámenes.
          </p>
          
          {loading ? (
            <div className="loading-videos">
              <div className="spinner"></div>
              <p>Cargando videos...</p>
            </div>
          ) : videosDelCurso.length === 0 ? (
            <div className="error-videos">
              <p>{error || 'No hay videos disponibles.'}</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="error-videos" style={{ marginBottom: '1rem' }}>
                  <p>{error}</p>
                </div>
              )}
            <div className="videos-grid">
              {videosDelCurso.map((video) => {
                const desbloqueado = isVideoDesbloqueado(video.numero);
                const mensajeBloqueo = getMensajeBloqueo(video.numero);
                const videoVisto = videosVistos[video.numero];
                
                return (
                  <div 
                    key={video.numero} 
                    className={`video-card ${!desbloqueado ? 'video-bloqueado' : ''} ${videoVisto ? 'video-visto' : ''}`}
                  >
                    <div className="video-numero">
                      {desbloqueado ? (
                        <span className="numero-badge">{video.numero}</span>
                      ) : (
                        <span className="lock-icon">🔒</span>
                      )}
                    </div>
                    <div className="video-info">
                      <h4>Video {video.numero}: {video.titulo}</h4>
                      {videoVisto && (
                        <span className="video-estado-badge">
                          {videoVisto.completado ? '✅ Completado' : '⏳ En progreso'}
                        </span>
                      )}
                    </div>
                    <div className="video-action">
                      {desbloqueado ? (
                        <button 
                          className="btn-ver-video"
                          onClick={() => handleVerVideo(video)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          Ver Video
                        </button>
                      ) : (
                        <div className="video-bloqueado-info">
                          <span className="mensaje-bloqueo">{mensajeBloqueo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstudioTeorico;
