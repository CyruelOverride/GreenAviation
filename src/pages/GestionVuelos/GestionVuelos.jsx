import React, { useState, useEffect } from 'react';
import { flightAPI, userAPI } from '../../services/api';
import './GestionVuelos.css';

const GestionVuelos = ({ userRole, isAuthenticated }) => {
  const [flights, setFlights] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlumno, setSelectedAlumno] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFlight, setNewFlight] = useState({
    alumno: '',
    fecha: new Date().toISOString().split('T')[0],
    duracion: '',
    calificacion: '',
    tipoVuelo: 'Dual',
    aeronave: { tipo: '', matricula: '' },
    instructor: { nombre: '', licencia: '' },
    observaciones: '',
    horasVuelo: { tipo: 'Dual', cantidad: '' },
    estado: 'Completado',
    maniobras: []
  });
  const [newManiobra, setNewManiobra] = useState({ nombre: '', calificacion: '' });

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      fetchData();
    }
  }, [isAuthenticated, userRole, selectedAlumno]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los alumnos
      const studentsResponse = await userAPI.getAll({ role: 'alumno' });
      if (studentsResponse.success && studentsResponse.data.users) {
        setStudents(studentsResponse.data.users);
      }

      // Obtener vuelos (filtrados por alumno si está seleccionado)
      const filters = selectedAlumno ? { alumnoId: selectedAlumno } : {};
      const flightsResponse = await flightAPI.getAll(filters);
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

  const handleCreateFlight = async (e) => {
    e.preventDefault();
    try {
      const flightData = {
        ...newFlight,
        duracion: parseInt(newFlight.duracion),
        calificacion: parseInt(newFlight.calificacion),
        horasVuelo: {
          ...newFlight.horasVuelo,
          cantidad: parseFloat(newFlight.horasVuelo.cantidad) || 0
        }
      };

      await flightAPI.create(flightData);
      alert('Vuelo creado exitosamente!');
      setShowCreateForm(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert(`Error al crear vuelo: ${err.message}`);
    }
  };

  const handleAddManiobra = () => {
    if (newManiobra.nombre) {
      setNewFlight({
        ...newFlight,
        maniobras: [
          ...newFlight.maniobras,
          {
            nombre: newManiobra.nombre,
            calificacion: newManiobra.calificacion || null,
            completada: true
          }
        ]
      });
      setNewManiobra({ nombre: '', calificacion: '' });
    }
  };

  const handleRemoveManiobra = (index) => {
    setNewFlight({
      ...newFlight,
      maniobras: newFlight.maniobras.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setNewFlight({
      alumno: '',
      fecha: new Date().toISOString().split('T')[0],
      duracion: '',
      calificacion: '',
      tipoVuelo: 'Dual',
      aeronave: { tipo: '', matricula: '' },
      instructor: { nombre: '', licencia: '' },
      observaciones: '',
      horasVuelo: { tipo: 'Dual', cantidad: '' },
      estado: 'Completado',
      maniobras: []
    });
    setNewManiobra({ nombre: '', calificacion: '' });
  };

  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <div className="gestion-vuelos-container">
        <div className="error-message">
          <p>Acceso denegado. Solo los administradores pueden acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="gestion-vuelos-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="gestion-vuelos-container">
      <div className="vuelos-header">
        <h1>Gestión de Vuelos</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          + Registrar Nuevo Vuelo
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="alumno-filter">Filtrar por Alumno:</label>
          <select
            id="alumno-filter"
            value={selectedAlumno}
            onChange={(e) => setSelectedAlumno(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los alumnos</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.nombreCompleto || `${student.nombre} ${student.apellido}`.trim() || student.email}
              </option>
            ))}
          </select>
        </div>
        <div className="stats-info">
          <span>Total de vuelos: <strong>{flights.length}</strong></span>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Nuevo Vuelo</h2>
              <button className="close-btn" onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            <form onSubmit={handleCreateFlight} className="flight-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Alumno *</label>
                  <select
                    value={newFlight.alumno}
                    onChange={(e) => setNewFlight({ ...newFlight, alumno: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar alumno</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.nombreCompleto || `${student.nombre} ${student.apellido}`.trim() || student.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={newFlight.fecha}
                    onChange={(e) => setNewFlight({ ...newFlight, fecha: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duración (minutos) *</label>
                  <input
                    type="number"
                    value={newFlight.duracion}
                    onChange={(e) => setNewFlight({ ...newFlight, duracion: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Calificación (0-100) *</label>
                  <input
                    type="number"
                    value={newFlight.calificacion}
                    onChange={(e) => setNewFlight({ ...newFlight, calificacion: e.target.value })}
                    required
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de Vuelo *</label>
                  <select
                    value={newFlight.tipoVuelo}
                    onChange={(e) => setNewFlight({ ...newFlight, tipoVuelo: e.target.value })}
                    required
                  >
                    <option value="Dual">Dual</option>
                    <option value="Solo">Solo</option>
                    <option value="Chequeo">Chequeo</option>
                    <option value="Práctico">Práctico</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Aeronave</label>
                  <input
                    type="text"
                    value={newFlight.aeronave.tipo}
                    onChange={(e) => setNewFlight({
                      ...newFlight,
                      aeronave: { ...newFlight.aeronave, tipo: e.target.value }
                    })}
                    placeholder="Ej: Cessna 172"
                  />
                </div>
                <div className="form-group">
                  <label>Matrícula</label>
                  <input
                    type="text"
                    value={newFlight.aeronave.matricula}
                    onChange={(e) => setNewFlight({
                      ...newFlight,
                      aeronave: { ...newFlight.aeronave, matricula: e.target.value }
                    })}
                    placeholder="Ej: CX-ABC"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Instructor</label>
                  <input
                    type="text"
                    value={newFlight.instructor.nombre}
                    onChange={(e) => setNewFlight({
                      ...newFlight,
                      instructor: { ...newFlight.instructor, nombre: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Licencia del Instructor</label>
                  <input
                    type="text"
                    value={newFlight.instructor.licencia}
                    onChange={(e) => setNewFlight({
                      ...newFlight,
                      instructor: { ...newFlight.instructor, licencia: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Horas de Vuelo</label>
                  <select
                    value={newFlight.horasVuelo.tipo}
                    onChange={(e) => setNewFlight({
                      ...newFlight,
                      horasVuelo: { ...newFlight.horasVuelo, tipo: e.target.value }
                    })}
                  >
                    <option value="Dual">Dual</option>
                    <option value="Solo">Solo</option>
                    <option value="Instrumental">Instrumental</option>
                    <option value="Noche">Noche</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad de Horas</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFlight.horasVuelo.cantidad}
                    onChange={(e) => setNewFlight({
                      ...newFlight,
                      horasVuelo: { ...newFlight.horasVuelo, cantidad: e.target.value }
                    })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Observaciones</label>
                <textarea
                  value={newFlight.observaciones}
                  onChange={(e) => setNewFlight({ ...newFlight, observaciones: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="maniobras-section">
                <label>Maniobras</label>
                <div className="maniobras-input">
                  <input
                    type="text"
                    placeholder="Nombre de la maniobra"
                    value={newManiobra.nombre}
                    onChange={(e) => setNewManiobra({ ...newManiobra, nombre: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Calificación (opcional)"
                    value={newManiobra.calificacion}
                    onChange={(e) => setNewManiobra({ ...newManiobra, calificacion: e.target.value })}
                  />
                  <button type="button" onClick={handleAddManiobra} className="btn-add">
                    Agregar
                  </button>
                </div>
                {newFlight.maniobras.length > 0 && (
                  <div className="maniobras-list">
                    {newFlight.maniobras.map((maniobra, index) => (
                      <div key={index} className="maniobra-item">
                        <span>{maniobra.nombre}</span>
                        {maniobra.calificacion && <span className="calificacion"> - {maniobra.calificacion}</span>}
                        <button
                          type="button"
                          onClick={() => handleRemoveManiobra(index)}
                          className="btn-remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => { setShowCreateForm(false); resetForm(); }} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar Vuelo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="vuelos-table-container">
        {flights.length === 0 ? (
          <div className="empty-message">No hay vuelos registrados.</div>
        ) : (
          <table className="vuelos-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Alumno</th>
                <th>Duración</th>
                <th>Calificación</th>
                <th>Tipo</th>
                <th>Horas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight) => (
                <tr key={flight.id}>
                  <td>{flight.fecha ? new Date(flight.fecha).toLocaleDateString('es-ES') : 'N/A'}</td>
                  <td>
                    {flight.alumno?.nombreCompleto || 
                     `${flight.alumno?.nombre || ''} ${flight.alumno?.apellido || ''}`.trim() || 
                     flight.alumno?.email || 'N/A'}
                  </td>
                  <td>{flight.duracion || 0} min</td>
                  <td>
                    <span className={`calificacion-badge ${flight.calificacion >= 70 ? 'aprobado' : 'reprobado'}`}>
                      {flight.calificacion || 0}%
                    </span>
                  </td>
                  <td>{flight.tipoVuelo || 'N/A'}</td>
                  <td>{flight.horasVuelo?.cantidad || 0} ({flight.horasVuelo?.tipo || 'N/A'})</td>
                  <td>
                    <span className={`estado-badge ${flight.estado?.toLowerCase()}`}>
                      {flight.estado || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GestionVuelos;

