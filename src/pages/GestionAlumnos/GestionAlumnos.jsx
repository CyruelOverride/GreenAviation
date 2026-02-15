import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { userAPI } from '../../services/api';
import './GestionAlumnos.css';

const GestionAlumnos = ({ userRole, isAuthenticated }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    role: 'alumno',
    nombre: '',
    apellido: '',
    cedula: '',
    numeroTelefono: '',
    edad: '',
    fechaInicioCurso: new Date().toISOString().split('T')[0],
    estado: 'Cursando'
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Cargar estudiantes
  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      loadStudents();
    }
  }, [isAuthenticated, userRole]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getAll({ role: 'alumno' });
      if (response.success) {
        setStudents(response.data.users || []);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los alumnos');
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = students.map(student => ({
      'ID': student.id || student._id,
      'Nombre': `${student.nombre || ''} ${student.apellido || ''}`.trim(),
      'Email': student.email,
      'Cédula': student.cedula || '',
      'Teléfono': student.numeroTelefono || '',
      'Edad': student.edad || '',
      'Progreso (%)': student.progreso || 0,
      'Estado': student.estado || 'Cursando',
      'Fecha Inicio': student.fechaInicioCurso ? new Date(student.fechaInicioCurso).toLocaleDateString() : ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alumnos');

    const fecha = new Date().toISOString().split('T')[0];
    const fileName = `alumnos_${fecha}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
  };

  const handleExportStudent = (student) => {
    const data = [{
      'ID': student.id || student._id,
      'Nombre': student.nombre || '',
      'Apellido': student.apellido || '',
      'Nombre Completo': `${student.nombre || ''} ${student.apellido || ''}`.trim(),
      'Email': student.email,
      'Cédula': student.cedula || '',
      'Teléfono': student.numeroTelefono || '',
      'Edad': student.edad || '',
      'Progreso (%)': student.progreso || 0,
      'Estado': student.estado || 'Cursando',
      'Curso': student.curso || 'Piloto Privado',
      'Fecha de Inscripción': student.fechaInicioCurso ? new Date(student.fechaInicioCurso).toLocaleDateString() : '',
      'Último Acceso': student.ultimoAcceso ? new Date(student.ultimoAcceso).toLocaleDateString() : ''
    }];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alumno');

    const nombreArchivo = `${student.nombre || 'alumno'}_${student.apellido || ''}`.replace(/\s+/g, '_').toLowerCase();
    const fileName = `alumno_${nombreArchivo}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      const response = await userAPI.create(createFormData);
      
      if (response.success) {
        alert('Usuario creado exitosamente');
        setShowCreateModal(false);
        setCreateFormData({
          email: '',
          password: '',
          role: 'alumno',
          nombre: '',
          apellido: '',
          cedula: '',
          numeroTelefono: '',
          edad: '',
          fechaInicioCurso: new Date().toISOString().split('T')[0],
          estado: 'Cursando'
        });
        loadStudents();
      }
    } catch (err) {
      alert(err.message || 'Error al crear usuario');
      console.error('Error creating user:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="gestion-alumnos">
        <h1 className="page-title">Gestión de Alumnos</h1>
        <div className="info-card-unauthenticated">
          <h2>👥 Gestión de Alumnos</h2>
          <p>En esta sección encontrarás:</p>
          <ul>
            <li>Visualización de todos los alumnos en formato tabla</li>
            <li>Exportación de datos a Excel</li>
            <li>Acceso al historial académico completo</li>
            <li>Consulta de registros de vuelo</li>
            <li>Información detallada de cada alumno</li>
          </ul>
          <p className="auth-prompt">Inicia sesión para acceder a esta sección</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="gestion-alumnos">
        <h1 className="page-title">Mi Perfil</h1>
        <div className="profile-section">
          <div className="profile-card">
            <h2>Información Personal</h2>
            <div className="profile-info">
              <div className="info-item">
                <label>Nombre:</label>
                <span>Cargando...</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>Cargando...</span>
              </div>
              <div className="info-item">
                <label>Curso:</label>
                <span>Piloto Privado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-alumnos">
      <div className="page-header">
        <h1 className="page-title">Gestión de Alumnos</h1>
        <div className="header-actions">
          <button 
            className="btn-primary" 
            onClick={() => setShowCreateModal(true)}
          >
            + Nuevo Usuario
          </button>
          <button className="btn-primary" onClick={handleExport}>
            Exportar a Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          padding: '15px', 
          background: '#fee', 
          color: '#c33', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Cargando alumnos...</p>
        </div>
      ) : (
        <div className="students-table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Cédula</th>
                <th>Teléfono</th>
                <th>Progreso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    No hay alumnos registrados
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student._id || student.id}>
                    <td>{student._id?.toString().substring(0, 8) || student.id}</td>
                    <td>{`${student.nombre || ''} ${student.apellido || ''}`.trim() || 'Sin nombre'}</td>
                    <td>{student.email}</td>
                    <td>{student.cedula || '-'}</td>
                    <td>{student.numeroTelefono || '-'}</td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${student.progreso || 0}%` }}
                          ></div>
                        </div>
                        <span>{student.progreso || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${(student.estado || 'Cursando').toLowerCase()}`}>
                        {student.estado || 'Cursando'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-secondary"
                          onClick={() => handleViewDetails(student)}
                        >
                          Ver Detalles
                        </button>
                        <button 
                          className="btn-export"
                          onClick={() => handleExportStudent(student)}
                        >
                          Exportar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Crear Usuario */}
      {showCreateModal && (
        <div className="student-modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Crear Nuevo Usuario</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-body">
              <div className="form-group">
                <label>Email (Gmail) *</label>
                <input
                  type="email"
                  name="email"
                  value={createFormData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="usuario@gmail.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={createFormData.password}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={createFormData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={createFormData.apellido}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cédula</label>
                  <input
                    type="text"
                    name="cedula"
                    value={createFormData.cedula}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="numeroTelefono"
                    value={createFormData.numeroTelefono}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Edad</label>
                  <input
                    type="number"
                    name="edad"
                    value={createFormData.edad}
                    onChange={handleInputChange}
                    min="16"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={createFormData.estado}
                    onChange={handleInputChange}
                  >
                    <option value="Cursando">Cursando</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Fecha de Inicio del Curso</label>
                <input
                  type="date"
                  name="fechaInicioCurso"
                  value={createFormData.fechaInicioCurso}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedStudent && (
        <div className="student-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Información Completa - {`${selectedStudent.nombre || ''} ${selectedStudent.apellido || ''}`.trim() || 'Alumno'}</h2>
              <button className="modal-close" onClick={handleCloseDetails}>×</button>
            </div>
            <div className="modal-body">
              <div className="student-details">
                <div className="detail-row">
                  <label>ID:</label>
                  <span>{selectedStudent._id?.toString() || selectedStudent.id}</span>
                </div>
                <div className="detail-row">
                  <label>Nombre:</label>
                  <span>{selectedStudent.nombre || '-'}</span>
                </div>
                <div className="detail-row">
                  <label>Apellido:</label>
                  <span>{selectedStudent.apellido || '-'}</span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="detail-row">
                  <label>Cédula:</label>
                  <span>{selectedStudent.cedula || '-'}</span>
                </div>
                <div className="detail-row">
                  <label>Teléfono:</label>
                  <span>{selectedStudent.numeroTelefono || '-'}</span>
                </div>
                <div className="detail-row">
                  <label>Edad:</label>
                  <span>{selectedStudent.edad || '-'}</span>
                </div>
                <div className="detail-row">
                  <label>Progreso:</label>
                  <span>{selectedStudent.progreso || 0}%</span>
                </div>
                <div className="detail-row">
                  <label>Estado:</label>
                  <span className={`status-badge ${(selectedStudent.estado || 'Cursando').toLowerCase()}`}>
                    {selectedStudent.estado || 'Cursando'}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Curso:</label>
                  <span>{selectedStudent.curso || 'Piloto Privado'}</span>
                </div>
                <div className="detail-row">
                  <label>Fecha de Inscripción:</label>
                  <span>
                    {selectedStudent.fechaInicioCurso 
                      ? new Date(selectedStudent.fechaInicioCurso).toLocaleDateString() 
                      : '-'}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Último Acceso:</label>
                  <span>
                    {selectedStudent.ultimoAcceso 
                      ? new Date(selectedStudent.ultimoAcceso).toLocaleDateString() 
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseDetails}>Cerrar</button>
              <button className="btn-export" onClick={() => handleExportStudent(selectedStudent)}>
                Exportar a Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAlumnos;
