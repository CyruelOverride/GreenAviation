// Configuración de la API
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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
    const response = await fetch(`${BACKEND_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
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

export default {
  authAPI,
  userAPI,
  flightAPI,
};

