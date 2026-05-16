import React, { useState, useEffect, useCallback } from 'react';
import { examenAPI } from '../../services/api';
import DetalleExamen from '../Examenes/DetalleExamen';

const ExamenesAlumnoModal = ({ alumno, onClose }) => {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examenDetalleId, setExamenDetalleId] = useState(null);

  const alumnoId = alumno.id || alumno._id;
  const nombreAlumno =
    `${alumno.nombre || ''} ${alumno.apellido || ''}`.trim() || alumno.email || 'Alumno';

  const loadExamenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await examenAPI.getAll(alumnoId);
      if (response.success) {
        const lista = response.data.examenes || [];
        lista.sort((a, b) => {
          const fa = a.fechaFinalizacion || a.fechaCreacion || '';
          const fb = b.fechaFinalizacion || b.fechaCreacion || '';
          return new Date(fb) - new Date(fa);
        });
        setExamenes(lista);
      } else {
        setError('No se pudieron cargar los exámenes del alumno.');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los exámenes.');
    } finally {
      setLoading(false);
    }
  }, [alumnoId]);

  useEffect(() => {
    loadExamenes();
  }, [loadExamenes]);

  const formatFecha = (ex) => {
    const raw = ex.fechaFinalizacion || ex.fechaCreacion;
    if (!raw) return '—';
    return new Date(raw).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClose = () => {
    if (examenDetalleId) {
      setExamenDetalleId(null);
    } else {
      onClose();
    }
  };

  return (
    <div className="student-modal" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div
        className={`modal-content ${examenDetalleId ? 'modal-content-examen-detalle' : 'modal-content-examenes-lista'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!examenDetalleId && (
          <div className="modal-header">
            <h2>Exámenes — {nombreAlumno}</h2>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </div>
        )}

        {examenDetalleId ? (
          <div className="modal-body modal-body-examen-detalle">
            <DetalleExamen
              examenId={examenDetalleId}
              onVolver={() => setExamenDetalleId(null)}
              volverLabel="Volver al listado"
              embedded
              alumnoNombre={nombreAlumno}
            />
          </div>
        ) : (
          <div className="modal-body">
            {loading && <p className="historial-loading">Cargando exámenes…</p>}
            {error && <p className="examenes-alumno-error">{error}</p>}
            {!loading && !error && examenes.length === 0 && (
              <p className="historial-empty">Este alumno no tiene exámenes registrados.</p>
            )}
            {!loading && !error && examenes.length > 0 && (
              <div className="historial-table-wrap">
                <table className="historial-table">
                  <thead>
                    <tr>
                      <th>Examen</th>
                      <th>Capítulo</th>
                      <th>Fecha</th>
                      <th>Puntaje</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examenes.map((ex) => (
                      <tr key={ex.id}>
                        <td>{ex.nombre || '—'}</td>
                        <td>{ex.capitulo || '—'}</td>
                        <td>{formatFecha(ex)}</td>
                        <td>{ex.puntaje != null ? `${Number(ex.puntaje).toFixed(2)}%` : '—'}</td>
                        <td>
                          <span className={`status-badge ${(ex.estado || '').toLowerCase()}`}>
                            {ex.estado || '—'}
                          </span>
                        </td>
                        <td>
                          {ex.estado === 'COMPLETADO' ? (
                            <button
                              type="button"
                              className="btn-ver-detalle-examen"
                              onClick={() => setExamenDetalleId(ex.id)}
                            >
                              Ver detalle
                            </button>
                          ) : (
                            <span className="examenes-alumno-sin-detalle">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamenesAlumnoModal;
