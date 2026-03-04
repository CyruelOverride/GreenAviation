// Configuración de la API
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Log en desarrollo para verificar la URL del backend
if (import.meta.env.DEV) {
  console.log('🔧 Backend URL configurada:', BACKEND_URL);
}

// Función helper para hacer peticiones
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const url = `${BACKEND_URL}${endpoint}`;
    console.log('🌐 Haciendo petición a:', url);
    
    const response = await fetch(url, config);
    
    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('❌ Respuesta no es JSON:', text);
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
      console.error('❌ Error en respuesta:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Si es un error de red (fetch falló)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('❌ Error de conexión:', error);
      throw new Error(`No se pudo conectar al servidor. Verifica que el backend esté corriendo en ${BACKEND_URL}`);
    }
    
    // Si ya es un Error con mensaje, lanzarlo tal cual
    if (error instanceof Error) {
      console.error('❌ API Error:', error.message);
      throw error;
    }
    
    // Cualquier otro error
    console.error('❌ Error desconocido:', error);
    throw new Error('Error al iniciar sesión. Por favor, intenta de nuevo.');
  }
};

// API de Autenticación
export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return apiRequest('/api/auth/me');
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// API de Usuarios
export const userAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/api/users${queryParams ? `?${queryParams}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/api/users/${id}`);
  },

  getHistorial: async (id) => {
    return apiRequest(`/api/users/${id}/historial`);
  },

  create: async (userData) => {
    return apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id, userData) => {
    return apiRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  addCalificacion: async (id, calificacion) => {
    return apiRequest(`/api/users/${id}/calificaciones`, {
      method: 'POST',
      body: JSON.stringify(calificacion),
    });
  },

  getStats: async () => {
    return apiRequest('/api/users/stats/overview');
  },

  exportExcel: async (id) => {
    const token = localStorage.getItem('token');
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${BACKEND_URL}/api/users/${id}/export-excel`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    // Obtener el blob del archivo
    const blob = await response.blob();
    
    // Crear un enlace temporal para descargar
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Obtener el nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `historial_alumno_${id}.xlsx`;
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
    }
    
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Archivo descargado exitosamente' };
  },
};

// API de Vuelos
export const flightAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/api/flights${queryParams ? `?${queryParams}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/api/flights/${id}`);
  },

  getByAlumno: async (alumnoId) => {
    return apiRequest(`/api/flights/alumno/${alumnoId}`);
  },

  create: async (flightData) => {
    return apiRequest('/api/flights', {
      method: 'POST',
      body: JSON.stringify(flightData),
    });
  },

  update: async (id, flightData) => {
    return apiRequest(`/api/flights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flightData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/flights/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return apiRequest('/api/flights/stats/overview');
  },
};

// API de Exámenes
export const examenAPI = {
  create: async (examenData) => {
    return apiRequest('/api/examenes', {
      method: 'POST',
      body: JSON.stringify(examenData),
    });
  },

  getById: async (id) => {
    return apiRequest(`/api/examenes/${id}`);
  },

  getAll: async (usuarioId = null) => {
    const query = usuarioId ? `?usuarioId=${usuarioId}` : '';
    return apiRequest(`/api/examenes${query}`);
  },

  responderPregunta: async (examenId, preguntaId, opcionSeleccionadaId) => {
    return apiRequest(`/api/examenes/${examenId}/preguntas/${preguntaId}`, {
      method: 'PUT',
      body: JSON.stringify({ opcionSeleccionadaId }),
    });
  },

  finalizar: async (examenId) => {
    return apiRequest(`/api/examenes/${examenId}/finalizar`, {
      method: 'POST',
    });
  },

  getStats: async (usuarioId = null) => {
    const query = usuarioId ? `?usuarioId=${usuarioId}` : '';
    return apiRequest(`/api/examenes/stats${query}`);
  },
};

// API de Preguntas
export const preguntaAPI = {
  getByCapitulo: async (capitulo) => {
    return apiRequest(`/api/preguntas?capitulo=${capitulo}`);
  },

  update: async (id, preguntaData) => {
    return apiRequest(`/api/preguntas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(preguntaData),
    });
  },
};

// API de Opciones
export const opcionAPI = {
  update: async (id, opcionData) => {
    return apiRequest(`/api/opciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(opcionData),
    });
  },
};

// API de Videos
export const videoAPI = {
  // Obtener progreso de videos y exámenes del usuario
  getProgress: async () => {
    return apiRequest('/api/videos/progress');
  },

  // Registrar inicio de visualización de un video
  startVideo: async (videoNumero) => {
    return apiRequest(`/api/videos/start/${videoNumero}`, {
      method: 'POST',
    });
  },

  // Verificar si un examen está desbloqueado
  checkExamUnlock: async (capitulo) => {
    return apiRequest(`/api/videos/exam-unlock/${capitulo}`);
  },
};

// API de Clases Online
export const claseOnlineAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/api/clases-online${queryParams ? `?${queryParams}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/api/clases-online/${id}`);
  },

  create: async (claseData) => {
    return apiRequest('/api/clases-online', {
      method: 'POST',
      body: JSON.stringify(claseData),
    });
  },

  update: async (id, claseData) => {
    return apiRequest(`/api/clases-online/${id}`, {
      method: 'PUT',
      body: JSON.stringify(claseData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/clases-online/${id}`, {
      method: 'DELETE',
    });
  },

  registrarAlumno: async (id, alumnoId = null) => {
    return apiRequest(`/api/clases-online/${id}/registrar-alumno`, {
      method: 'POST',
      body: JSON.stringify(alumnoId ? { alumnoId } : {}),
    });
  },

  eliminarAlumno: async (id, alumnoId) => {
    return apiRequest(`/api/clases-online/${id}/alumnos/${alumnoId}`, {
      method: 'DELETE',
    });
  },
};

// API de Recursos (para gestión de admin)
export const recursoAPI = {
  // Obtener todos los recursos
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/api/recursos${queryParams ? `?${queryParams}` : ''}`);
  },

  // Obtener un recurso por ID
  getById: async (id) => {
    return apiRequest(`/api/recursos/${id}`);
  },

  // Crear nuevo recurso (link)
  create: async (recursoData) => {
    return apiRequest('/api/recursos', {
      method: 'POST',
      body: JSON.stringify(recursoData),
    });
  },

  // Subir archivo
  upload: async (formData) => {
    const token = localStorage.getItem('token');
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${BACKEND_URL}/api/recursos/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // No incluir Content-Type, el navegador lo setea automáticamente con el boundary
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al subir archivo');
    }

    return data;
  },

  // Actualizar recurso
  update: async (id, recursoData) => {
    return apiRequest(`/api/recursos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recursoData),
    });
  },

  // Eliminar recurso
  delete: async (id) => {
    return apiRequest(`/api/recursos/${id}`, {
      method: 'DELETE',
    });
  },

  // Obtener categorías
  getCategorias: async () => {
    return apiRequest('/api/recursos/categorias');
  },
};

// API de Artículos (Blog) - listado y por slug pueden llamarse sin token (público)
export const articuloAPI = {
  list: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/articulos${query ? `?${query}` : ''}`);
  },
  getBySlug: async (slug) => {
    return apiRequest(`/api/articulos/slug/${encodeURIComponent(slug)}`);
  },
  getById: async (id) => {
    return apiRequest(`/api/articulos/${id}`);
  },
  create: async (data) => {
    return apiRequest('/api/articulos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id, data) => {
    return apiRequest(`/api/articulos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id) => {
    return apiRequest(`/api/articulos/${id}`, { method: 'DELETE' });
  },
  getRecursos: async (articuloId) => {
    return apiRequest(`/api/articulos/${articuloId}/recursos`);
  },
  addRecursos: async (articuloId, recursoIds, orden) => {
    return apiRequest(`/api/articulos/${articuloId}/recursos`, {
      method: 'POST',
      body: JSON.stringify({ recursoIds, orden }),
    });
  },
  removeRecurso: async (articuloId, recursoId) => {
    return apiRequest(`/api/articulos/${articuloId}/recursos/${recursoId}`, {
      method: 'DELETE',
    });
  },
};

export default {
  authAPI,
  userAPI,
  flightAPI,
  examenAPI,
  preguntaAPI,
  opcionAPI,
  videoAPI,
  recursoAPI,
  articuloAPI,
  claseOnlineAPI,
};

