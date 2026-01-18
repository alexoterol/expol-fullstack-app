// ==================== SERVICIO DE API ====================
// Conexión con el backend Rails

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Helper para obtener el token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper para hacer requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Si es 204 No Content, no intentar parsear JSON
    if (response.status === 204) {
      return { success: true };
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw { 
        status: response.status, 
        message: data.error || data.errors || 'Error en la solicitud',
        data 
      };
    }
    
    return data;
  } catch (error) {
    if (error.status) throw error;
    console.error('API Error:', error);
    throw { status: 0, message: 'Error de conexión con el servidor' };
  }
};

// ==================== AUTH SERVICE ====================
export const authService = {
  async register(userData) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ user: userData }),
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
  },

  async login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!getAuthToken();
  },
};

// ==================== LISTINGS SERVICE ====================
export const listingsService = {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/listings${queryString ? `?${queryString}` : ''}`);
  },

  async getById(id) {
    return apiRequest(`/listings/${id}`);
  },

  async create(listingData) {
    return apiRequest('/listings', {
      method: 'POST',
      body: JSON.stringify({ listing: listingData }),
    });
  },

  async update(id, listingData) {
    return apiRequest(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ listing: listingData }),
    });
  },

  async delete(id) {
    return apiRequest(`/listings/${id}`, {
      method: 'DELETE',
    });
  },

  async getMyListings() {
    return apiRequest('/listings/my_listings');
  },

  async toggleStatus(id) {
    return apiRequest(`/listings/${id}/toggle_status`, {
      method: 'PATCH',
    });
  },
};

// ==================== SEARCH SERVICE ====================
export const searchService = {
  async search(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/search${queryString ? `?${queryString}` : ''}`);
  },

  async getSuggestions(query) {
    return apiRequest(`/search/suggestions?q=${encodeURIComponent(query)}`);
  },

  async getCategoriesStats() {
    return apiRequest('/search/categories_stats');
  },
};

// ==================== FAVORITES SERVICE ====================
export const favoritesService = {
  async getAll() {
    const data = await apiRequest('/favorites');
    // El backend devuelve { favorites: [...], meta: {...} }
    // Retornamos solo el array de favoritos
    return data.favorites || [];
  },

  async add(listingId) {
    return apiRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId }),
    });
  },

  async remove(favoriteId) {
    return apiRequest(`/favorites/${favoriteId}`, {
      method: 'DELETE',
    });
  },

  async removeByListing(listingId) {
    return apiRequest(`/favorites/remove_by_listing/${listingId}`, {
      method: 'DELETE',
    });
  },

  async check(listingId) {
    return apiRequest(`/favorites/check/${listingId}`);
  },
};

// ==================== USERS SERVICE ====================
export const usersService = {
  async getMe() {
    return apiRequest('/users/me');
  },

  async updateMe(userData) {
    return apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ user: userData }),
    });
  },

  async getProfile(userId) {
    return apiRequest(`/users/${userId}/profile`);
  },

  async getUserListings(userId) {
    return apiRequest(`/users/${userId}/listings`);
  },

  async getUserRatings(userId) {
    return apiRequest(`/users/${userId}/ratings`);
  },
};

// ==================== RATINGS SERVICE ====================
export const ratingsService = {
  async create(ratingData) {
    return apiRequest('/ratings', {
      method: 'POST',
      body: JSON.stringify({ rating: ratingData }),
    });
  },

  async update(id, ratingData) {
    return apiRequest(`/ratings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ rating: ratingData }),
    });
  },

  async delete(id) {
    return apiRequest(`/ratings/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CONVERSATIONS SERVICE ====================
export const conversationsService = {
  async getAll() {
    const data = await apiRequest('/conversations');
    return data.conversations || [];
  },

  async getById(id) {
    const data = await apiRequest(`/conversations/${id}`);
    return data.conversation;
  },

  async create(listingId) {
    return apiRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId }),
    });
  },

  async sendMessage(conversationId, content) {
    const data = await apiRequest(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return data.message;
  },

  async markAsRead(conversationId) {
    return apiRequest(`/conversations/${conversationId}/messages/mark_read`, {
      method: 'PATCH',
    });
  },
};

// Export default con todos los servicios
export default {
  auth: authService,
  listings: listingsService,
  search: searchService,
  favorites: favoritesService,
  users: usersService,
  ratings: ratingsService,
  conversations: conversationsService,
};
