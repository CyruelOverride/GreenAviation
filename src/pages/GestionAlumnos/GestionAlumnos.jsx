import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GestionAlumnos.css';

const GestionAlumnos = ({ userRole, isAuthenticated }) => {
  const [students] = useState([
    { id: 1, name: 'Juan Pérez', email: 'juan@email.com', progress: 65, status: 'Activo' },
    { id: 2, name: 'María García', email: 'maria@email.com', progress: 80, status: 'Activo' },
    { id: 3, name: 'Carlos López', email: 'carlos@email.com', progress: 45, status: 'Activo' },
    { id: 4, name: 'Ana Martínez', email: 'ana@email.com', progress: 90, status: 'Activo' },
  ]);

  const handleExport = () => {
    // Simulación de exportación a Excel
    alert('Funcionalidad de exportación a Excel - En desarrollo');
  };

  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
  };

  const handleExportStudent = (student) => {
    alert(`Funcionalidad de exportación a Excel para ${student.name} - En desarrollo`);
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
                <span>Juan Pérez</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>juan@email.com</span>
              </div>
              <div className="info-item">
                <label>Curso:</label>
                <span>Piloto Privado</span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h2>Progreso Académico</h2>
            <div className="progress-info">
              <div className="progress-item">
                <span>Progreso General:</span>
                <span className="progress-value">65%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h2>Registros de Vuelo</h2>
            <div className="flight-records">
              <div className="flight-record">
                <span>Vuelo 1 - 15/01/2024</span>
                <button className="btn-secondary">Ver Detalles</button>
              </div>
              <div className="flight-record">
                <span>Vuelo 2 - 20/01/2024</span>
                <button className="btn-secondary">Ver Detalles</button>
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
        <button className="btn-primary" onClick={handleExport}>
          Exportar a Excel
        </button>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Progreso</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <div className="progress-cell">
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <span>{student.progress}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${student.status.toLowerCase()}`}>
                    {student.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-secondary"
                      onClick={() => handleViewDetails(student)}
                    >
                      Ver Información Completa
                    </button>
                    <button 
                      className="btn-export"
                      onClick={() => handleExportStudent(student)}
                    >
                      Exportar a Excel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-sections">
        <div className="admin-card">
          <h2>Historial Académico</h2>
          <p>Accede al historial completo de todos los alumnos</p>
          <button className="btn-primary">Ver Historial Completo</button>
        </div>

        <div className="admin-card">
          <h2>Registros de Vuelo</h2>
          <p>Gestiona y consulta los registros de vuelo de los alumnos</p>
          <button className="btn-primary">Ver Registros</button>
        </div>

        <div className="admin-card">
          <h2>Integración CloudAhoy</h2>
          <p>Conecta con la API de CloudAhoy para gestión de datos de vuelo</p>
          <button className="btn-secondary">Configurar Integración</button>
        </div>
      </div>

      {selectedStudent && (
        <div className="student-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Información Completa - {selectedStudent.name}</h2>
              <button className="modal-close" onClick={handleCloseDetails}>×</button>
            </div>
            <div className="modal-body">
              <div className="student-details">
                <div className="detail-row">
                  <label>ID:</label>
                  <span>{selectedStudent.id}</span>
                </div>
                <div className="detail-row">
                  <label>Nombre Completo:</label>
                  <span>{selectedStudent.name}</span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="detail-row">
                  <label>Progreso:</label>
                  <span>{selectedStudent.progress}%</span>
                </div>
                <div className="detail-row">
                  <label>Estado:</label>
                  <span className={`status-badge ${selectedStudent.status.toLowerCase()}`}>
                    {selectedStudent.status}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Curso:</label>
                  <span>Piloto Privado</span>
                </div>
                <div className="detail-row">
                  <label>Fecha de Inscripción:</label>
                  <span>15/01/2024</span>
                </div>
                <div className="detail-row">
                  <label>Último Acceso:</label>
                  <span>20/01/2024</span>
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

