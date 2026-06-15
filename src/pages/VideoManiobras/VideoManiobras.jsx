import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recursoAPI } from '../../services/api';
import '../EstudioTeorico/EstudioTeorico.css';
import './VideoManiobras.css';

const VideoManiobras = ({ isAuthenticated }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!isAuthenticated) {
        setVideos([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await recursoAPI.getAll({ categoria: 'videoManiobra' });
        if (response.success && response.data?.recursos?.length) {
          const sorted = [...response.data.recursos].sort(
            (a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.nombre.localeCompare(b.nombre)
          );
          setVideos(sorted);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error('Error al cargar videos de maniobras:', err);
        setError(err.message || 'Error al cargar los videos');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [isAuthenticated]);

  const handleVerVideo = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isAuthenticated) {
    return (
      <div className="video-maniobras">
        <h1 className="page-title">Videos de Maniobras</h1>
        <div className="info-card-unauthenticated">
          <h2>Videos de Maniobras</h2>
          <p>En esta sección encontrarás:</p>
          <ul>
            <li>Videos explicativos de maniobras de vuelo</li>
            <li>Material de preparación para la parte práctica</li>
            <li>Recursos organizados por orden de estudio</li>
          </ul>
          <p className="auth-prompt">Inicia sesión para acceder a los videos</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="video-maniobras">
      <h1 className="page-title">Videos de Maniobras</h1>

      <div className="videos-curso-section">
        <h2>Videos de Maniobras</h2>
        <p className="videos-descripcion">
          Material audiovisual para preparar y repasar las maniobras de vuelo requeridas en la formación práctica.
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
        ) : videos.length === 0 ? (
          <div className="error-videos">
            <p>No hay videos de maniobras disponibles. Contactá al administrador.</p>
          </div>
        ) : (
          <div className="videos-grid">
            {videos.map((video, index) => {
              const numero = video.orden || index + 1;
              return (
                <div key={video.id} className="video-card">
                  <div className="video-numero">
                    <span className="numero-badge">{numero}</span>
                  </div>
                  <div className="video-info">
                    <h4>
                      Video {numero}: {video.nombre}
                    </h4>
                    {video.descripcion && (
                      <p className="video-descripcion-item">{video.descripcion}</p>
                    )}
                  </div>
                  <div className="video-action">
                    <button
                      className="btn-ver-video"
                      onClick={() => handleVerVideo(video.rutaOUrl)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Ver Video
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoManiobras;
