import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import './EstudioTeorico.css';

// Lista de videos del curso con sus links de Google Drive
const videosDelCurso = [
  { numero: 1, titulo: 'Principios del vuelo', driveLink: 'https://drive.google.com/file/d/1gufozkH1NeP8282OUCoNAu2VcDPVKvid/view?usp=drive_link' },
  { numero: 2, titulo: 'Resistencia parásita', driveLink: 'https://drive.google.com/file/d/1EEQZ0W93haLzt786nKmMCA5g3nSDxBOM/view?usp=drive_link' },
  { numero: 3, titulo: 'Factores de carga', driveLink: 'https://drive.google.com/file/d/1W5MZnQRVsW9-uQPZLPOTrCMUK2rrzXhQ/view?usp=drive_link' },
  { numero: 4, titulo: 'Virajes ROT y radio', driveLink: 'https://drive.google.com/file/d/1NH6yUZjomsA_Ug_HLnJne_xQRthq-6jt/view?usp=drive_link' },
  { numero: 5, titulo: 'Tipos de estabilidad', driveLink: 'https://drive.google.com/file/d/11A01VByhBZDkK4scUdcvHJ0whbm5b-Nu/view?usp=drive_link' },
  { numero: 6, titulo: 'Estabilidad de los 3 ejes', driveLink: 'https://drive.google.com/file/d/1ujo7U9hmyrakiQydBKjZul_Klm4kTcLx/view?usp=drive_link' },
  { numero: 7, titulo: 'Controles de vuelo', driveLink: 'https://drive.google.com/file/d/1BVZwKpks5yQhw4ypi934H2SecYqmAsVz/view?usp=drive_link' },
  { numero: 8, titulo: 'Ejes de giro', driveLink: 'https://drive.google.com/file/d/1Y2uQI4N3XAQgcPHkCbGkGMXs5J2vjUMZ/view?usp=drive_link' },
  { numero: 9, titulo: 'Compensadores', driveLink: 'https://drive.google.com/file/d/1XM6ojovK_iqYiIyijQ1eyIPKyFzTr7_G/view?usp=drive_link' },
  { numero: 10, titulo: 'Peso, carga y centrado 1', driveLink: 'https://drive.google.com/file/d/15NxGuggMQ5dIuxQEyIbFgSYbmW0o2JZb/view?usp=drive_link' },
  { numero: 11, titulo: 'Peso, carga y centrado 2', driveLink: 'https://drive.google.com/file/d/16PvXJV0xvvA_yk8H_oYJo1EvaOrfbyfS/view?usp=drive_link' },
  { numero: 12, titulo: 'Cálculo peso y centrado', driveLink: 'https://drive.google.com/file/d/1Fs6U4hF2nij7ZOaAObbmVEMJhKj8Sobs/view?usp=drive_link' },
  { numero: 13, titulo: 'Cálculo peso y centrado 2', driveLink: 'https://drive.google.com/file/d/1_v02PTFABeCMPjFanlKM239zUH6RzRCs/view?usp=drive_link' },
  { numero: 14, titulo: 'Rendimiento y limitaciones de la aeronave', driveLink: 'https://drive.google.com/file/d/1wGv3g8Gz3XTQlt280sBvVWBpLXdHbnce/view?usp=drive_link' },
  { numero: 15, titulo: 'Autonomía', driveLink: 'https://drive.google.com/file/d/1hLmY9ceqKOR-E_cv6XwF6xM0eg-FiMcf/view?usp=drive_link' },
  { numero: 16, titulo: 'Alcance', driveLink: 'https://drive.google.com/file/d/1I-SpjJBrC3qc6EjUl71F5HT4BeDDKGBH/view?usp=drive_link' },
  { numero: 17, titulo: 'Partes del avión', driveLink: 'https://drive.google.com/file/d/1jpxQsQacbik-cSFy7t6H3oZkKTgrvuZA/view?usp=drive_link' },
  { numero: 18, titulo: 'Tren de aterrizaje', driveLink: 'https://drive.google.com/file/d/1EQiOfXd0jwm8peB8wd1yxYd44V5UNlZB/view?usp=drive_link' },
  { numero: 19, titulo: 'Motores', driveLink: 'https://drive.google.com/file/d/1c0BLyd1Ul3-4gWJDhK_YDnhPzUVXXoG9/view?usp=drive_link' },
  { numero: 20, titulo: 'Sistema eléctrico', driveLink: 'https://drive.google.com/file/d/1uSe4zIK7VIMdm8_goBMzc2ebGS55nfYs/view?usp=drive_link' },
  { numero: 21, titulo: 'Sistema de combustible', driveLink: 'https://drive.google.com/file/d/1rBqH--oRnxxFDzsSopQUIz7o2GuuBQcf/view?usp=drive_link' },
  { numero: 22, titulo: 'Sistema de lubricaciones', driveLink: 'https://drive.google.com/file/d/1YIbWU8kPNNFKyy-k_RpbjAgeHQDsGNas/view?usp=drive_link' },
  { numero: 23, titulo: 'Pitot estático', driveLink: 'https://drive.google.com/file/d/1IKfDkKO1scXForyHNf-T10kME3OrLDdW/view?usp=drive_link' },
  { numero: 24, titulo: 'Instrumentos giroscópicos', driveLink: 'https://drive.google.com/file/d/1xeyC41aV9EduN1lmSkW2Yom9BYQ03ZX6/view?usp=drive_link' },
  { numero: 25, titulo: 'Brújula', driveLink: 'https://drive.google.com/file/d/1yN4g_D9fAa5EpGzZR5Z2FSyBByIUwRVD/view?usp=drive_link' },
  { numero: 26, titulo: 'Curso y rumbo magnético', driveLink: 'https://drive.google.com/file/d/1sCTOr7q5X0O454wJssuaMiqFXbAY-MYl/view?usp=drive_link' },
  { numero: 27, titulo: 'Navegación observada y a estima', driveLink: 'https://drive.google.com/file/d/1F4SfDbfOeEqXIQDsIDmdViQbjnHVi59v/view?usp=drive_link' },
  { numero: 28, titulo: 'Computador 1', driveLink: 'https://drive.google.com/file/d/1LPwqqLx70Ck2GcrNDVlj_kxmAGfywb6u/view?usp=drive_link' },
  { numero: 29, titulo: 'Computador viento', driveLink: 'https://drive.google.com/file/d/1wQ5yG5Hf2e6cAqA9a67i8WL6dZNlRPim/view?usp=drive_link' },
  { numero: 30, titulo: 'Radio ayudas', driveLink: 'https://drive.google.com/file/d/1Fjqh_ghkw6atvOcNOtLXJIq6gSWxoL78/view?usp=drive_link' },
  { numero: 31, titulo: 'Capas de la atmósfera', driveLink: 'https://drive.google.com/file/d/1e-TcLvTD-Yp3Lgo6i3g7TqIBag3VT526/view?usp=drive_link' },
  { numero: 32, titulo: 'Masas y frentes', driveLink: 'https://drive.google.com/file/d/1LlVTgmyCt2M2_SBtTH_EsGvHq5kgDmIZ/view?usp=drive_link' },
  { numero: 33, titulo: 'Frentes explicados', driveLink: 'https://drive.google.com/file/d/1MhZJe5SxIP6yZIKSbTRyelPDezDMfQB-/view?usp=drive_link' },
  { numero: 34, titulo: 'METAR', driveLink: 'https://drive.google.com/file/d/1psbIvkIXUxFlmYNEkb9Hc68gwAYkXeJX/view?usp=drive_link' },
  { numero: 35, titulo: 'Gestión en cabina', driveLink: 'https://drive.google.com/file/d/1ENDZUeK3saWrmCRBrgvxwckaI80L5oKr/view?usp=drive_link' },
  { numero: 36, titulo: 'Factores aeromédicos', driveLink: 'https://drive.google.com/file/d/1U4JO_QUx6DUeiRx4o3dy0qJW-IUzjx4u/view?usp=drive_link' },
  { numero: 37, titulo: 'Señales aeropuertos', driveLink: 'https://drive.google.com/file/d/17DMDmA1q50q9YgMgorJpveXdDbDiYPt9/view?usp=drive_link' },
  { numero: 38, titulo: 'Luces de pista', driveLink: 'https://drive.google.com/file/d/1v_a9rSB0TUwJxEoUN5VpS7HE-a8NhuZm/view?usp=drive_link' },
];

// Los videos se desbloquean en orden: el video 1 siempre está disponible;
// para ver el video N (N>1) debes haber completado el video N-1.
// Así se evita la dependencia circular con los exámenes (el examen del capítulo
// requiere ver los 3 videos del capítulo; los videos no requieren aprobar exámenes).

const EstudioTeorico = ({ isAuthenticated, userRole }) => {
  const [progress, setProgress] = useState(0);
  const [videosVistos, setVideosVistos] = useState({});
  const [examenesPorCapitulo, setExamenesPorCapitulo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);

  // Cargar progreso de videos, exámenes y porcentaje de avance (primer fetch)
  useEffect(() => {
    const fetchProgress = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await videoAPI.getProgress();
        if (response.success) {
          setVideosVistos(response.data.videosVistos || {});
          setExamenesPorCapitulo(response.data.examenesPorCapitulo || {});
          // Progreso real del alumno (basado en exámenes aprobados), admin siempre 100%
          const progresoReal = userRole === 'admin' ? 100 : (response.data.progreso ?? 0);
          setProgress(progresoReal);
        }
      } catch (err) {
        console.error('Error al cargar progreso:', err);
        setError('Error al cargar el progreso de videos');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
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
          ) : error ? (
            <div className="error-videos">
              <p>{error}</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default EstudioTeorico;
