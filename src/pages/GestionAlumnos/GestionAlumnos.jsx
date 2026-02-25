import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';
import './GestionAlumnos.css';

const GestionAlumnos = ({ userRole, isAuthenticated }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [historialAlumno, setHistorialAlumno] = useState(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDriveLink, setEditingDriveLink] = useState(null);
  const [driveLinkValue, setDriveLinkValue] = useState('');
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    role: 'alumno',
    nombre: '',
    apellido: '',
    cedula: '',
    numeroTelefono: '',
    telefono: '',
    celular: '',
    fechaNac: '',
    direccion: '',
    departamento: '',
    ciudad: '',
    sexo: '',
    contactoEmergencia: '',
    nombreEmergencia: '',
    emergenciaMedica: '',
    fechaInicioCurso: new Date().toISOString().split('T')[0],
    estado: 'Cursando',
    tieneEntrenamientoPrevio: false,
    entrenamientoPrevio: {
      dual: '',
      navDual: '',
      solo: '',
      navSolo: '',
      nocturnoSolo: '',
      noctSolo: '',
      aterrizajesNoct: '',
      instruccionTeorica: '',
      instruccionTierra: '',
      instruccionVuelo: '',
      chequeoFasesComp: '',
      ciacInstructor: '',
      carteDeTransferencia: false
    },
    inscripcion: {
      certificadoMedico: '',
      licenciaAlumno: '',
      fechaEmitidoCertificadoMedico: '',
      vencimientoCertificadoMedico: '',
      fechaEmitidoLicenciaAlumno: '',
      vencimientoLicenciaAlumno: ''
    }
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


  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setHistorialAlumno(null);
    setLoadingHistorial(true);
    const studentId = student.id || student._id;
    try {
      const response = await userAPI.getHistorial(studentId);
      if (response.success && response.data) {
        setHistorialAlumno(response.data);
      }
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
    setHistorialAlumno(null);
  };

  const handleExportStudent = async (student) => {
    try {
      const studentId = student.id || student._id;
      if (!studentId) {
        alert('Error: No se pudo identificar el ID del alumno');
        return;
      }

      // Llamar al backend para exportar el Excel completo
      await userAPI.exportExcel(studentId);
    } catch (err) {
      alert(err.message || 'Error al exportar el historial del alumno');
      console.error('Error exporting student:', err);
    }
  };

  // Abrir link de Drive del alumno
  const handleOpenDrive = (student) => {
    if (student.driveLink) {
      window.open(student.driveLink, '_blank', 'noopener,noreferrer');
    } else {
      // Si no tiene link, mostrar modal para editarlo
      setEditingDriveLink(student.id || student._id);
      setDriveLinkValue('');
    }
  };

  // Iniciar edición del link de Drive
  const handleEditDriveLink = (student, e) => {
    e.stopPropagation();
    setEditingDriveLink(student.id || student._id);
    setDriveLinkValue(student.driveLink || '');
  };

  // Guardar link de Drive
  const handleSaveDriveLink = async (studentId) => {
    try {
      const response = await userAPI.update(studentId, { driveLink: driveLinkValue });
      if (response.success) {
        // Actualizar el estado local
        setStudents(prev => prev.map(s => 
          (s.id === studentId || s._id === studentId) 
            ? { ...s, driveLink: driveLinkValue } 
            : s
        ));
        setEditingDriveLink(null);
        setDriveLinkValue('');
      }
    } catch (err) {
      alert(err.message || 'Error al guardar el link de Drive');
      console.error('Error saving drive link:', err);
    }
  };

  // Cancelar edición del link de Drive
  const handleCancelDriveLink = () => {
    setEditingDriveLink(null);
    setDriveLinkValue('');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      
      // Preparar datos para enviar
      const dataToSend = {
        ...createFormData,
        // Solo enviar entrenamientoPrevio si tieneEntrenamientoPrevio es true
        entrenamientoPrevio: createFormData.tieneEntrenamientoPrevio ? createFormData.entrenamientoPrevio : null,
        // Limpiar valores vacíos de entrenamientoPrevio
        entrenamientoPrevio: createFormData.tieneEntrenamientoPrevio ? Object.fromEntries(
          Object.entries(createFormData.entrenamientoPrevio).map(([key, value]) => [
            key,
            value === '' ? null : (typeof value === 'string' && !isNaN(value) && value !== '') ? parseFloat(value) : value
          ])
        ) : null
      };
      
      const response = await userAPI.create(dataToSend);
      
      if (response.success) {
        alert('Usuario creado exitosamente');
        setShowCreateModal(false);
        // Resetear formulario
        setCreateFormData({
          email: '',
          password: '',
          role: 'alumno',
          nombre: '',
          apellido: '',
          cedula: '',
          numeroTelefono: '',
          telefono: '',
          celular: '',
          fechaNac: '',
          direccion: '',
          departamento: '',
          ciudad: '',
          sexo: '',
          contactoEmergencia: '',
          nombreEmergencia: '',
          emergenciaMedica: '',
          fechaInicioCurso: new Date().toISOString().split('T')[0],
          estado: 'Cursando',
          tieneEntrenamientoPrevio: false,
          entrenamientoPrevio: {
            dual: '',
            navDual: '',
            solo: '',
            navSolo: '',
            nocturnoSolo: '',
            noctSolo: '',
            aterrizajesNoct: '',
            instruccionTeorica: '',
            instruccionTierra: '',
            instruccionVuelo: '',
            chequeoFasesComp: '',
            ciacInstructor: '',
            carteDeTransferencia: false
          },
          inscripcion: {
            certificadoMedico: '',
            licenciaAlumno: '',
            fechaEmitidoCertificadoMedico: '',
            vencimientoCertificadoMedico: '',
            fechaEmitidoLicenciaAlumno: '',
            vencimientoLicenciaAlumno: ''
          }
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
    const { name, value, type, checked } = e.target;
    
    // Manejar campos anidados (entrenamientoPrevio, inscripcion)
    if (name.startsWith('entrenamientoPrevio.')) {
      const field = name.split('.')[1];
      setCreateFormData(prev => ({
        ...prev,
        entrenamientoPrevio: {
          ...prev.entrenamientoPrevio,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('inscripcion.')) {
      const field = name.split('.')[1];
      setCreateFormData(prev => ({
        ...prev,
        inscripcion: {
          ...prev.inscripcion,
          [field]: value
        }
      }));
    } else {
      setCreateFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
                        <div className="drive-button-container">
                          <button 
                            className={`btn-drive ${student.driveLink ? '' : 'no-link'}`}
                            onClick={() => handleOpenDrive(student)}
                            title={student.driveLink ? 'Abrir carpeta en Drive' : 'Sin link configurado'}
                          >
                            📁 Drive
                          </button>
                          <button 
                            className="btn-edit-drive"
                            onClick={(e) => handleEditDriveLink(student, e)}
                            title="Editar link de Drive"
                          >
                            ✏️
                          </button>
                        </div>
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
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
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
              <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Datos Personales</h3>
              
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
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fechaNac"
                    value={createFormData.fechaNac}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="numeroTelefono"
                    value={createFormData.numeroTelefono}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Celular</label>
                  <input
                    type="text"
                    name="celular"
                    value={createFormData.celular}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono Fijo</label>
                  <input
                    type="text"
                    name="telefono"
                    value={createFormData.telefono}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Sexo</label>
                  <select
                    name="sexo"
                    value={createFormData.sexo}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={createFormData.direccion}
                  onChange={handleInputChange}
                  placeholder="Calle y número"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={createFormData.ciudad}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Departamento</label>
                  <input
                    type="text"
                    name="departamento"
                    value={createFormData.departamento}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Contacto de Emergencia</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Contacto</label>
                  <input
                    type="text"
                    name="nombreEmergencia"
                    value={createFormData.nombreEmergencia}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono de Emergencia</label>
                  <input
                    type="text"
                    name="contactoEmergencia"
                    value={createFormData.contactoEmergencia}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Información Médica Relevante</label>
                <textarea
                  name="emergenciaMedica"
                  value={createFormData.emergenciaMedica}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Alergias, condiciones médicas, etc."
                />
              </div>
              
              <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Información del Curso</h3>
              
              <div className="form-group">
                <label>Fecha de Inicio del Curso</label>
                <input
                  type="date"
                  name="fechaInicioCurso"
                  value={createFormData.fechaInicioCurso}
                  onChange={handleInputChange}
                />
              </div>
              
              <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Entrenamiento Previo</h3>
              
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    name="tieneEntrenamientoPrevio"
                    checked={createFormData.tieneEntrenamientoPrevio}
                    onChange={handleInputChange}
                  />
                  <span>Tiene entrenamiento previo</span>
                </label>
              </div>
              
              {createFormData.tieneEntrenamientoPrevio && (
                <div style={{ marginLeft: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '15px' }}>Horas de Vuelo</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Dual</label>
                      <input
                        type="number"
                        name="entrenamientoPrevio.dual"
                        value={createFormData.entrenamientoPrevio.dual}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nav Dual</label>
                      <input
                        type="number"
                        name="entrenamientoPrevio.navDual"
                        value={createFormData.entrenamientoPrevio.navDual}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Solo</label>
                      <input
                        type="number"
                        name="entrenamientoPrevio.solo"
                        value={createFormData.entrenamientoPrevio.solo}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nav Solo</label>
                      <input
                        type="number"
                        name="entrenamientoPrevio.navSolo"
                        value={createFormData.entrenamientoPrevio.navSolo}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nocturno Solo</label>
                      <input
                        type="number"
                        name="entrenamientoPrevio.nocturnoSolo"
                        value={createFormData.entrenamientoPrevio.nocturnoSolo}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Noct Solo</label>
                      <input
                        type="number"
                        name="entrenamientoPrevio.noctSolo"
                        value={createFormData.entrenamientoPrevio.noctSolo}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Aterrizajes Nocturnos</label>
                    <input
                      type="number"
                      name="entrenamientoPrevio.aterrizajesNoct"
                      value={createFormData.entrenamientoPrevio.aterrizajesNoct}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                    />
                  </div>
                  
                  <h4 style={{ marginTop: '20px', marginBottom: '15px' }}>Instrucción</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Instrucción Teórica</label>
                      <input
                        type="number"
                        name="entrenamientoPrevio.instruccionTeorica"
                        value={createFormData.entrenamientoPrevio.instruccionTeorica}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Instrucción Tierra</label>
                      <input
                        type="number"
                        name="entrenamientoPrevio.instruccionTierra"
                        value={createFormData.entrenamientoPrevio.instruccionTierra}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Instrucción Vuelo</label>
                    <input
                      type="number"
                      name="entrenamientoPrevio.instruccionVuelo"
                      value={createFormData.entrenamientoPrevio.instruccionVuelo}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                    />
                  </div>
                  
                  <h4 style={{ marginTop: '20px', marginBottom: '15px' }}>Información Adicional</h4>
                  <div className="form-group">
                    <label>Chequeo Fases Comp</label>
                    <input
                      type="text"
                      name="entrenamientoPrevio.chequeoFasesComp"
                      value={createFormData.entrenamientoPrevio.chequeoFasesComp}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>CIAC Instructor (separar por comas si hay varios)</label>
                    <input
                      type="text"
                      name="entrenamientoPrevio.ciacInstructor"
                      value={createFormData.entrenamientoPrevio.ciacInstructor}
                      onChange={handleInputChange}
                      placeholder="Ej: Juan Gabriel, Juan Martin"
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        name="entrenamientoPrevio.carteDeTransferencia"
                        checked={createFormData.entrenamientoPrevio.carteDeTransferencia}
                        onChange={handleInputChange}
                      />
                      <span>Carte de Transferencia</span>
                    </label>
                  </div>
                </div>
              )}
              
              <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Inscripción</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Certificado Médico</label>
                  <input
                    type="text"
                    name="inscripcion.certificadoMedico"
                    value={createFormData.inscripcion.certificadoMedico}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Licencia Alumno</label>
                  <input
                    type="text"
                    name="inscripcion.licenciaAlumno"
                    value={createFormData.inscripcion.licenciaAlumno}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha Emitido Certificado Médico</label>
                  <input
                    type="date"
                    name="inscripcion.fechaEmitidoCertificadoMedico"
                    value={createFormData.inscripcion.fechaEmitidoCertificadoMedico}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Vencimiento Certificado Médico</label>
                  <input
                    type="date"
                    name="inscripcion.vencimientoCertificadoMedico"
                    value={createFormData.inscripcion.vencimientoCertificadoMedico}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha Emitido Licencia Alumno</label>
                  <input
                    type="date"
                    name="inscripcion.fechaEmitidoLicenciaAlumno"
                    value={createFormData.inscripcion.fechaEmitidoLicenciaAlumno}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Vencimiento Licencia Alumno</label>
                  <input
                    type="date"
                    name="inscripcion.vencimientoLicenciaAlumno"
                    value={createFormData.inscripcion.vencimientoLicenciaAlumno}
                    onChange={handleInputChange}
                  />
                </div>
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

      {/* Modal de Editar Link de Drive */}
      {editingDriveLink && (
        <div className="student-modal">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>📁 Editar Link de Drive</h2>
              <button className="modal-close" onClick={handleCancelDriveLink}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Link de Google Drive del alumno</label>
                <input
                  type="url"
                  value={driveLinkValue}
                  onChange={(e) => setDriveLinkValue(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Pega aquí el link de la carpeta de Drive del alumno
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCancelDriveLink}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={() => handleSaveDriveLink(editingDriveLink)}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedStudent && (
        <div className="student-modal">
          <div className="modal-content modal-content-details">
            <div className="modal-header">
              <h2>Detalle del alumno — {`${selectedStudent.nombre || ''} ${selectedStudent.apellido || ''}`.trim() || 'Alumno'}</h2>
              <button className="modal-close" onClick={handleCloseDetails}>×</button>
            </div>
            <div className="modal-body">
              <section className="student-details">
                <h3 className="details-section-title">Datos personales</h3>
                <div className="detail-grid">
                  <div className="detail-row">
                    <label>ID</label>
                    <span>{selectedStudent._id?.toString() || selectedStudent.id}</span>
                  </div>
                  <div className="detail-row">
                    <label>Nombre</label>
                    <span>{selectedStudent.nombre || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Apellido</label>
                    <span>{selectedStudent.apellido || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Email</label>
                    <span>{selectedStudent.email}</span>
                  </div>
                  <div className="detail-row">
                    <label>Cédula</label>
                    <span>{selectedStudent.cedula || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Teléfono</label>
                    <span>{selectedStudent.numeroTelefono || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Progreso</label>
                    <span>{selectedStudent.progreso ?? 0}%</span>
                  </div>
                  <div className="detail-row">
                    <label>Estado</label>
                    <span className={`status-badge ${(selectedStudent.estado || 'Cursando').toLowerCase()}`}>
                      {selectedStudent.estado || 'Cursando'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Último acceso</label>
                    <span>
                      {selectedStudent.ultimoAcceso
                        ? new Date(selectedStudent.ultimoAcceso).toLocaleDateString()
                        : '-'}
                    </span>
                  </div>
                </div>
              </section>

              {loadingHistorial ? (
                <div className="historial-loading">Cargando historial…</div>
              ) : historialAlumno && (
                <>
                  <section className="historial-section">
                    <h3 className="details-section-title">Exámenes realizados</h3>
                    {historialAlumno.examenes?.length > 0 ? (
                      <div className="historial-table-wrap">
                        <table className="historial-table">
                          <thead>
                            <tr>
                              <th>Nombre</th>
                              <th>Capítulo</th>
                              <th>Fecha</th>
                              <th>Puntaje</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historialAlumno.examenes.map((ex) => (
                              <tr key={ex.id}>
                                <td>{ex.nombre || '-'}</td>
                                <td>{ex.capitulo || '-'}</td>
                                <td>
                                  {ex.fechaFinalizacion
                                    ? new Date(ex.fechaFinalizacion).toLocaleDateString()
                                    : ex.fechaCreacion
                                      ? new Date(ex.fechaCreacion).toLocaleDateString()
                                      : '-'}
                                </td>
                                <td>{ex.puntaje != null ? ex.puntaje : '-'}</td>
                                <td>
                                  <span className={`status-badge ${(ex.estado || '').toLowerCase()}`}>
                                    {ex.estado || '-'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="historial-empty">No hay exámenes registrados.</p>
                    )}
                  </section>

                  <section className="historial-section">
                    <h3 className="details-section-title">Videos vistos</h3>
                    {historialAlumno.videosVistos?.length > 0 ? (
                      <div className="historial-table-wrap">
                        <table className="historial-table">
                          <thead>
                            <tr>
                              <th>Video</th>
                              <th>Fecha de visualización</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historialAlumno.videosVistos.map((v) => (
                              <tr key={v.id}>
                                <td>Video #{v.videoNumero}</td>
                                <td>
                                  {v.startedAt
                                    ? new Date(v.startedAt).toLocaleString()
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="historial-empty">No hay videos vistos registrados.</p>
                    )}
                  </section>

                  <section className="historial-section">
                    <h3 className="details-section-title">Clases ingresadas</h3>
                    {historialAlumno.clasesIngresadas?.length > 0 ? (
                      <div className="historial-table-wrap">
                        <table className="historial-table">
                          <thead>
                            <tr>
                              <th>Fecha clase</th>
                              <th>Estado</th>
                              <th>Instructor</th>
                              <th>Enlace</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historialAlumno.clasesIngresadas.map((c) => (
                              <tr key={c.id}>
                                <td>
                                  {c.fechaHoraInicio
                                    ? new Date(c.fechaHoraInicio).toLocaleString()
                                    : c.fechaRegistro
                                      ? new Date(c.fechaRegistro).toLocaleString()
                                      : '-'}
                                </td>
                                <td>
                                  <span className={`status-badge ${(c.estado || '').toLowerCase()}`}>
                                    {c.estado || '-'}
                                  </span>
                                </td>
                                <td>{c.instructor || '-'}</td>
                                <td>
                                  {c.link ? (
                                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="historial-link">
                                      Ver clase
                                    </a>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="historial-empty">No hay clases registradas.</p>
                    )}
                  </section>
                </>
              )}
            </div>
            <div className="modal-footer modal-footer-actions">
              <button className="btn-secondary" onClick={handleCloseDetails}>
                Cerrar
              </button>
              <button
                className={`btn-drive ${selectedStudent.driveLink ? '' : 'no-link'}`}
                onClick={() => {
                  if (selectedStudent.driveLink) {
                    window.open(selectedStudent.driveLink, '_blank', 'noopener,noreferrer');
                  } else {
                    handleCloseDetails();
                    setEditingDriveLink(selectedStudent.id || selectedStudent._id);
                    setDriveLinkValue('');
                  }
                }}
              >
                📁 {selectedStudent.driveLink ? 'Ver Drive' : 'Agregar link Drive'}
              </button>
              <button className="btn-export" onClick={() => handleExportStudent(selectedStudent)}>
                Exportar registro en Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAlumnos;
