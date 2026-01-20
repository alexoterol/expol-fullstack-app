import React, { useState, useEffect, useRef } from 'react';
import { Heart, Search, Plus, MessageCircle, User, X, Star, MapPin, Filter, ChevronDown, Trash2, LogOut, Send, ArrowLeft } from 'lucide-react';
import { authService, listingsService, favoritesService, searchService, conversationsService } from './services/api';

// ==================== CONFIGURACIÓN ====================
const categories = [
  { name: 'Libros', icon: '📚' },
  { name: 'Electrónicos', icon: '💻' },
  { name: 'Muebles', icon: '🪑' },
  { name: 'Deportes', icon: '⚽' },
  { name: 'Ropa', icon: '👕' },
  { name: 'Otros', icon: '📦' },
];

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

const getImageUrl = (listing) => {
  if (!listing) return 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400';
  if (listing.image_url) return listing.image_url;
  const images = {
    'Libros': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    'Electrónicos': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    'Muebles': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    'Deportes': 'https://images.unsplash.com/photo-1461896836934-28f586151a5c?w=400',
    'Ropa': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
    'Otros': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
  };
  return images[listing.category] || images['Otros'];
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Ahora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
  return date.toLocaleDateString();
};

// ==================== TOAST ====================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white`}>
      {message}
    </div>
  );
};

// ==================== LOGIN MODAL ====================
const LoginModal = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        await onLogin(email, password);
      } else {
        await onRegister({ name, email, password, password_confirmation: password });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required={!isLoginMode}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.email@espol.edu.ec"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : (isLoginMode ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-blue-600 hover:underline"
          >
            {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
          <p className="font-medium mb-1">Credenciales de prueba:</p>
          <p className="text-gray-600">jose.chong@espol.edu.ec / password123</p>
        </div>
      </div>
    </div>
  );
};

// ==================== NAVBAR ====================
const Navbar = ({ onSearch, currentUser, onNavigate, onLogout, onLoginClick, onCategorySelect, unreadMessages }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('home')} className="flex items-center space-x-2 hover:opacity-80">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">CampusMarket</span>
          </button>

          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar laptops, libros, bicicletas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <button onClick={() => onNavigate('create')} className="hidden sm:flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <Plus className="w-5 h-5" />
                  <span>Publicar</span>
                </button>

                <button onClick={() => onNavigate('messages')} className="relative p-2 hover:bg-gray-100 rounded-full">
                  <MessageCircle className="w-6 h-6 text-gray-700" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </button>

                <button onClick={() => onNavigate('favorites')} className="p-2 hover:bg-gray-100 rounded-full">
                  <Heart className="w-6 h-6 text-gray-700" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {currentUser.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium text-sm">{currentUser.name}</p>
                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                      </div>
                      <button
                        onClick={() => { onNavigate('profile'); setShowUserMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" /> Mi Perfil
                      </button>
                      <button
                        onClick={() => { onLogout(); setShowUserMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex space-x-6 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onCategorySelect(cat.name)}
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// ==================== PRODUCT CARD ====================
const ProductCard = ({ listing, onFavorite, isFavorited, onNavigate }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (isToggling) return;
    setIsToggling(true);
    await onFavorite(listing.id);
    setIsToggling(false);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="relative cursor-pointer" onClick={() => onNavigate('detail', listing)}>
        <img
          src={getImageUrl(listing)}
          alt={listing.title}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400'; }}
        />
        {listing.state === 'nuevo' && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">NUEVO</span>
        )}
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 disabled:opacity-50"
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{listing.title}</h3>
        <p className="text-blue-600 font-bold text-lg">${parseFloat(listing.price).toFixed(2)}</p>
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{listing.location}</span>
        </div>
        {listing.user && (
          <p className="text-xs text-gray-400 mt-1">Por: {listing.user.name}</p>
        )}
      </div>
    </div>
  );
};

// ==================== HOME PAGE ====================
const HomePage = ({ listings, onNavigate, favorites, onFavorite, currentUser, loading }) => {
  return (
    <main className="flex-1">
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Compra y vende entre estudiantes</h1>
          <p className="text-blue-100 mb-6">La plataforma de confianza de tu universidad</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => onNavigate('create')} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
              Comenzar a vender →
            </button>
            <button onClick={() => onNavigate('search')} className="border border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500">
              Explorar productos
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Publicaciones recientes</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando publicaciones...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay publicaciones disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                onFavorite={onFavorite}
                isFavorited={favorites.includes(listing.id)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

// ==================== SEARCH PAGE ====================
const SearchPage = ({ initialFilters, favorites, onFavorite, onNavigate }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: initialFilters?.query || '',
    category: initialFilters?.category || '',
    minPrice: '',
    maxPrice: '',
    state: ''
  });

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        query: initialFilters.query || prev.query,
        category: initialFilters.category || ''
      }));
    }
  }, [initialFilters]);

  useEffect(() => {
    loadListings();
  }, [filters.category]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.query) params.query = filters.query;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.state) params.state = filters.state;

      const data = await searchService.search(params);
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error buscando:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadListings();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ query: '', category: '', minPrice: '', maxPrice: '', state: '' });
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 bg-white p-4 rounded-lg shadow h-fit">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filtros
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="Palabra clave..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Todas</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Todos</option>
                <option value="nuevo">Nuevo</option>
                <option value="usado">Usado</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Buscar
            </button>

            <button
              onClick={clearFilters}
              className="w-full text-gray-600 py-2 hover:text-gray-800"
            >
              Limpiar filtros
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">{listings.length} resultados encontrados</p>
            {filters.category && (
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                {filters.category}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ProductCard
                  key={listing.id}
                  listing={listing}
                  onFavorite={onFavorite}
                  isFavorited={favorites.includes(listing.id)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

// ==================== FAVORITES PAGE ====================
const FavoritesPage = ({ onFavorite, onNavigate, currentUser, refreshKey }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [currentUser, refreshKey]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await favoritesService.getAll();
      const favListings = data.map(fav => fav.listing).filter(Boolean);
      const favIds = data.map(fav => fav.listing_id);
      setListings(favListings);
      setFavoriteIds(favIds);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId) => {
    await onFavorite(listingId);
    setListings(listings.filter(l => l.id !== listingId));
    setFavoriteIds(favoriteIds.filter(id => id !== listingId));
  };

  if (!currentUser) {
    return (
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mis Favoritos</h2>
        <p className="text-gray-500">Inicia sesión para ver tus favoritos</p>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mis Favoritos</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes favoritos aún</p>
          <button onClick={() => onNavigate('search')} className="mt-4 text-blue-600 hover:underline">
            Explorar productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ProductCard
              key={listing.id}
              listing={listing}
              onFavorite={handleRemoveFavorite}
              isFavorited={true}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </main>
  );
};

// ==================== PROFILE PAGE ====================
const ProfilePage = ({ currentUser, onNavigate, showToast }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    if (currentUser) {
      loadMyListings();
    }
  }, [currentUser]);

  const loadMyListings = async () => {
    try {
      const data = await listingsService.getMyListings();
      setListings(data.listings || data || []);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;

    try {
      await listingsService.delete(id);
      setListings(listings.filter(l => l.id !== id));
      showToast('Publicación eliminada', 'success');
    } catch (error) {
      showToast('Error al eliminar', 'error');
    }
  };

  if (!currentUser) {
    return (
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 text-center">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mi Perfil</h2>
        <p className="text-gray-500">Inicia sesión para ver tu perfil</p>
      </main>
    );
  }

  const activeListings = listings.filter(l => l.status === 'active' || !l.status);
  const soldListings = listings.filter(l => l.status === 'sold');

  const filteredListings = filter === 'todas' ? listings :
    filter === 'activas' ? activeListings : soldListings;

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {currentUser.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
            <p className="text-gray-500">{currentUser.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-600">4.8 (15 calificaciones)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{listings.length}</p>
            <p className="text-sm text-gray-500">Productos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{soldListings.length}</p>
            <p className="text-sm text-gray-500">Vendidos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{activeListings.length}</p>
            <p className="text-sm text-gray-500">Activos</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b px-4 py-3">
          <h3 className="font-bold text-gray-800">Mis Publicaciones</h3>
        </div>

        <div className="p-4">
          <button
            onClick={() => onNavigate('create')}
            className="w-full sm:w-auto mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Publicar nuevo producto
          </button>

          <div className="flex gap-2 mb-4 flex-wrap">
            {['todas', 'activas', 'vendidas'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({
                  f === 'todas' ? listings.length :
                  f === 'activas' ? activeListings.length : soldListings.length
                })
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredListings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No tienes publicaciones</p>
          ) : (
            <div className="space-y-4">
              {filteredListings.map(listing => (
                <div key={listing.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={getImageUrl(listing)}
                    alt={listing.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{listing.title}</h4>
                    <p className="text-blue-600 font-bold">${parseFloat(listing.price).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      listing.status === 'sold' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {listing.status === 'sold' ? 'Vendido' : 'Activo'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

// ==================== CREATE LISTING PAGE ====================
const CreateListingPage = ({ onNavigate, currentUser, showToast }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Otros',
    state: 'usado',
    location: 'FIEC'
  });
  const [loading, setLoading] = useState(false);

  const locations = ['FIEC', 'FIMCP', 'FCNM', 'EDCOM', 'Coliseo', 'Biblioteca'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showToast('Debes iniciar sesión', 'error');
      return;
    }

    setLoading(true);
    try {
      await listingsService.create(form);
      showToast('¡Publicación creada!', 'success');
      onNavigate('profile');
    } catch (error) {
      showToast(error.message || 'Error al crear publicación', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 text-center">
        <Plus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Publicar Producto</h2>
        <p className="text-gray-500">Inicia sesión para publicar</p>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => onNavigate('home')} className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-1">
        ← Volver
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Publicar nuevo producto</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título del producto *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            placeholder="Ej: MacBook Pro 13 pulgadas"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            placeholder="Describe tu producto en detalle..."
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (USD) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({...form, price: e.target.value})}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select
              value={form.state}
              onChange={(e) => setForm({...form, state: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="nuevo">Nuevo</option>
              <option value="usado">Usado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
            <select
              value={form.location}
              onChange={(e) => setForm({...form, location: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Publicando...' : 'Publicar producto'}
        </button>
      </form>
    </main>
  );
};

// ==================== PRODUCT DETAIL PAGE ====================
const ProductDetailPage = ({ listing, onNavigate, onFavorite, isFavorited, currentUser, showToast, onStartConversation }) => {
  if (!listing) return null;

  const handleContact = async () => {
    if (!currentUser) {
      showToast('Inicia sesión para contactar al vendedor', 'error');
      return;
    }

    if (listing.user_id === currentUser.id || listing.user?.id === currentUser.id) {
      showToast('No puedes contactarte contigo mismo', 'error');
      return;
    }

    try {
      const result = await conversationsService.create(listing.id);
      onStartConversation(result.conversation);
      showToast('Conversación iniciada', 'success');
    } catch (error) {
      showToast(error.message || 'Error al iniciar conversación', 'error');
    }
  };

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-6">
      <button onClick={() => onNavigate('home')} className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-1">
        ← Volver
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src={getImageUrl(listing)}
              alt={listing.title}
              className="w-full h-80 object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{listing.title}</h1>
            <p className="text-3xl font-bold text-blue-600 mb-4">${parseFloat(listing.price).toFixed(2)}</p>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded text-sm ${
                listing.state === 'nuevo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {listing.state === 'nuevo' ? 'Nuevo' : 'Usado'}
              </span>
              <span className="text-sm text-gray-500">{listing.category}</span>
            </div>

            <div className="flex items-center text-gray-500 mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{listing.location}</span>
            </div>

            <p className="text-gray-600 mb-6">{listing.description}</p>

            <div className="flex gap-3">
              <button
                onClick={handleContact}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> Contactar
              </button>
              <button
                onClick={() => onFavorite(listing.id)}
                className={`p-3 rounded-lg border ${
                  isFavorited ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {listing.user && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-2">Vendedor</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {listing.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{listing.user.name}</p>
                    <p className="text-sm text-gray-500">{listing.user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

// ==================== MESSAGES PAGE ====================
const MessagesPage = ({ currentUser, showToast, onUpdateUnread }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());

  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // --- WEBSOCKET ---
  useEffect(() => {
    if (!currentUser) return;
    loadConversations();
    if (wsRef.current) wsRef.current.close();

    const wsUrl = `${WS_URL}?user_id=${currentUser.id}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log('✅ WS Conectado');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'message':
            handleIncomingMessage(data);
            break;
          case 'user_status':
            setOnlineUsers(prev => {
              const newSet = new Set(prev);
              data.online ? newSet.add(data.user_id) : newSet.delete(data.user_id);
              return newSet;
            });
            break;
          case 'typing':
            if (data.user_id !== currentUser.id) {
              setTypingUsers(prev => new Set(prev).add(data.user_id));
              setTimeout(() => {
                setTypingUsers(prev => { const n = new Set(prev); n.delete(data.user_id); return n; });
              }, 3000);
            }
            break;
          case 'read_receipt':
            // 🔥 FIX: Comparación segura de IDs (String vs Number)
            const currentChatId = String(selectedConversationRef.current?.id);
            const eventChatId = String(data.conversation_id);

            if (currentChatId === eventChatId) {
              setMessages(prev => prev.map(m => m.is_mine ? { ...m, read: true } : m));
            }
            break;
        }
      } catch (error) { console.error('Error WS:', error); }
    };

    return () => { if (ws.readyState === 1) ws.close(); };
  }, [currentUser?.id]);

  // --- SCROLL AUTOMÁTICO AL CONTENEDOR (NO A LA VENTANA) ---
  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, typingUsers]);

  // --- HANDLERS ---
  const handleIncomingMessage = (data) => {
    const activeConv = selectedConversationRef.current;
    if (activeConv && data.conversation_id === activeConv.id) {
      // 1. Enviar ACK
      if (wsRef.current?.readyState === 1) wsRef.current.send(JSON.stringify({ type: 'ack', message_id: data.message_id }));

      setMessages(prev => {
        if (prev.some(m => m.id === data.message_id)) return prev;
        return [...prev, {
          id: data.message_id,
          content: data.content,
          created_at: data.created_at,
          is_mine: data.user_id === currentUser.id,
          user: data.sender || { id: data.user_id, name: 'Usuario' },
          read: false
        }];
      });

      // 2. Si no es mi mensaje, lo marco como leído
      if (data.user_id !== currentUser.id) {
        conversationsService.markAsRead(activeConv.id).catch(() => {});
        // 🔥 FIX: Avisar por WS que lo leí
        if (wsRef.current?.readyState === 1) {
          wsRef.current.send(JSON.stringify({ type: 'read', conversation_id: activeConv.id, user_id: currentUser.id }));
        }
      }
    }
    loadConversations();
  };

  const loadConversations = async () => {
    try {
      const data = await conversationsService.getAll();
      setConversations(data);
      if (onUpdateUnread) onUpdateUnread(data.reduce((acc, c) => acc + (c.unread_count || 0), 0));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadConversation = async (conv) => {
    setSelectedConversation(conv);
    try {
      const data = await conversationsService.getById(conv.id);
      setMessages(data.messages || []);

      if (conv.unread_count > 0) {
        await conversationsService.markAsRead(conv.id);
        // 🔥 FIX: Avisar por WS al abrir chat con mensajes no leídos
        if (wsRef.current?.readyState === 1) {
          wsRef.current.send(JSON.stringify({ type: 'read', conversation_id: conv.id, user_id: currentUser.id }));
        }
        loadConversations();
      }
    } catch (e) { if(showToast) showToast('Error cargando chat', 'error'); }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;
    const txt = newMessage.trim();
    setSending(true);
    setNewMessage('');

    try {
      const msg = await conversationsService.sendMessage(selectedConversation.id, txt);
      setMessages(p => [...p, msg]);
      loadConversations();
    } catch (e) {
      setNewMessage(txt);
      if(showToast) showToast('Error enviando', 'error');
    } finally { setSending(false); }
  };

  const handleTyping = () => {
    if (!selectedConversation || wsRef.current?.readyState !== 1) return;
    if (!typingTimeoutRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'typing', recipient_id: selectedConversation.other_user?.id, conversation_id: selectedConversation.id }));
      typingTimeoutRef.current = setTimeout(() => { typingTimeoutRef.current = null; }, 2000);
    }
  };

  const isUserOnline = (id) => onlineUsers.has(id);

  if (!currentUser) return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-12 text-center">
      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Mensajes</h2>
      <p className="text-gray-500">Inicia sesión para ver tus mensajes</p>
    </main>
  );

  return (
    <main className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mensajes</h2>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100" style={{ height: '80vh' }}>
          <div className="flex h-full">
            {/* SIDEBAR */}
            <div className={`w-full md:w-96 border-r border-gray-200 bg-gray-50 ${selectedConversation ? 'hidden md:block' : ''}`}>
              <div className="p-4 border-b bg-white"><h3 className="font-semibold text-gray-800">Conversaciones</h3></div>
              {loading ? (
                <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No tienes conversaciones</div>
              ) : (
                <div className="overflow-y-auto" style={{ height: 'calc(80vh - 68px)' }}>
                  {conversations.map(conv => (
                    <div key={conv.id} onClick={() => loadConversation(conv)} className={`p-4 border-b hover:bg-white cursor-pointer ${selectedConversation?.id === conv.id ? 'bg-white border-l-4 border-l-blue-600' : ''}`}>
                      <div className="flex gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">{conv.other_user?.name?.charAt(0).toUpperCase()}</div>
                          {isUserOnline(conv.other_user?.id) && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between"><p className="font-semibold truncate">{conv.other_user?.name}</p><span className="text-xs text-gray-500">{conv.last_message ? formatTime(conv.last_message.created_at) : ''}</span></div>
                          <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{conv.last_message?.is_mine ? 'Tú: ' : ''}{conv.last_message?.content}</p>
                        </div>
                        {conv.unread_count > 0 && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{conv.unread_count}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CHAT AREA */}
            <div className={`flex-1 flex flex-col bg-white ${!selectedConversation ? 'hidden md:flex' : ''}`}>
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b flex items-center gap-3 shadow-sm bg-white z-10">
                    <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2"><ArrowLeft className="w-5 h-5"/></button>
                    <div className="relative">
                       <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">{selectedConversation.other_user?.name?.charAt(0).toUpperCase()}</div>
                       {isUserOnline(selectedConversation.other_user?.id) && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{selectedConversation.other_user?.name}</h3>
                      <p className="text-xs text-gray-500">{isUserOnline(selectedConversation.other_user?.id) ? 'En línea' : 'Desconectado'}</p>
                    </div>
                  </div>

                  {/* MENSAJES CON REF PARA SCROLL */}
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.is_mine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border text-gray-800 rounded-bl-sm shadow-sm'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <div className={`text-[10px] mt-1 flex justify-end ${msg.is_mine ? 'text-blue-200' : 'text-gray-400'}`}>
                            {formatTime(msg.created_at)} {msg.is_mine && (msg.read ? ' ✓✓' : ' ✓')}
                          </div>
                        </div>
                      </div>
                    ))}
                    {typingUsers.has(selectedConversation.other_user?.id) && <div className="text-xs text-gray-500 ml-2 animate-pulse">Escribiendo...</div>}
                  </div>

                  <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={e => { setNewMessage(e.target.value); handleTyping(); }}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        disabled={sending}
                      />
                      <button onClick={handleSendMessage} disabled={!newMessage.trim() || sending} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <MessageCircle className="w-16 h-16 text-gray-200 mb-4" />
                  <p>Selecciona una conversación</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
// ==================== FOOTER ====================
const Footer = () => (
  <footer className="bg-white border-t mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center text-sm text-gray-600">
        © 2025 CampusMarket - ExPol Marketplace. Proyecto de Lenguajes de Programación ESPOL.
      </div>
    </div>
  </footer>
);

// ==================== MAIN APP ====================
export default function ExPolApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchFilters, setSearchFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [favoritesRefreshKey, setFavoritesRefreshKey] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    loadListings();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser]);

  const loadListings = async () => {
    try {
      const data = await listingsService.getAll();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error cargando listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await favoritesService.getAll();
      setFavorites(data.map(f => f.listing_id));
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      setFavorites([]);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleLogin = async (email, password) => {
    const data = await authService.login(email, password);
    setCurrentUser(data.user);
    showToast(`¡Bienvenido ${data.user.name}!`, 'success');
  };

  const handleRegister = async (userData) => {
    const data = await authService.register(userData);
    setCurrentUser(data.user);
    showToast('¡Cuenta creada exitosamente!', 'success');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setFavorites([]);
    setUnreadMessages(0);
    showToast('Sesión cerrada', 'info');
    setCurrentPage('home');
  };

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    if (page === 'detail') setSelectedListing(data);
    else if (page === 'search') setSearchFilters(data);
    window.scrollTo(0, 0);
  };

  const handleSearch = (query) => {
    handleNavigate('search', { query });
  };

  const handleCategorySelect = (category) => {
    setSearchFilters({ category });
    setCurrentPage('search');
    window.scrollTo(0, 0);
  };

  const handleFavorite = async (listingId) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (favorites.includes(listingId)) {
        await favoritesService.removeByListing(listingId);
        setFavorites(prev => prev.filter(id => id !== listingId));
        showToast('Eliminado de favoritos', 'info');
      } else {
        await favoritesService.add(listingId);
        setFavorites(prev => [...prev, listingId]);
        showToast('Agregado a favoritos', 'success');
      }
      setFavoritesRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error con favoritos:', error);
      showToast('Error al actualizar favoritos', 'error');
    }
  };

  const handleStartConversation = (conversation) => {
    setSelectedConversation(conversation);
    setCurrentPage('messages');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        onSearch={handleSearch}
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
        onCategorySelect={handleCategorySelect}
        unreadMessages={unreadMessages}
      />

      {currentPage === 'home' && (
        <HomePage
          listings={listings}
          onNavigate={handleNavigate}
          favorites={favorites}
          onFavorite={handleFavorite}
          currentUser={currentUser}
          loading={loading}
        />
      )}

      {currentPage === 'search' && (
        <SearchPage
          key={JSON.stringify(searchFilters)}
          initialFilters={searchFilters}
          favorites={favorites}
          onFavorite={handleFavorite}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'favorites' && (
        <FavoritesPage
          onFavorite={handleFavorite}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          refreshKey={favoritesRefreshKey}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      )}

      {currentPage === 'detail' && (
        <ProductDetailPage
          listing={selectedListing}
          onNavigate={handleNavigate}
          onFavorite={handleFavorite}
          isFavorited={favorites.includes(selectedListing?.id)}
          currentUser={currentUser}
          showToast={showToast}
          onStartConversation={handleStartConversation}
        />
      )}

      {currentPage === 'messages' && (
        <MessagesPage
          currentUser={currentUser}
          showToast={showToast}
          onUpdateUnread={setUnreadMessages}
        />
      )}

      {currentPage === 'create' && (
        <CreateListingPage
          onNavigate={handleNavigate}
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

      <Footer />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
