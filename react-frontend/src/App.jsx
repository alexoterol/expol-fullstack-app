import React, { useState, useEffect } from 'react';
import { Heart, Search, Plus, MessageCircle, User, Menu, X, Star, MapPin, Filter, ChevronDown, Send, Bell, Edit, Eye } from 'lucide-react';

// ==================== SIMULACIÓN DE API ====================
const API_BASE = 'http://localhost:3000/api/v1';

const mockUsers = [
  { id: 1, name: 'Alexandre Icaza', username: 'alex_icaza', email: 'alexandre.icaza@espol.edu.ec', rating: 4.8, totalRatings: 15, memberSince: 'Enero 2025', productsCount: 23, soldCount: 15, activeCount: 8 },
  { id: 2, name: 'Jose Chong', username: 'jose_chong', email: 'jose.chong@espol.edu.ec', rating: 4.9, totalRatings: 12, memberSince: 'Enero 2025', productsCount: 18, soldCount: 10, activeCount: 8 },
  { id: 3, name: 'Alex Otero', username: 'alex_otero', email: 'alex.otero@espol.edu.ec', rating: 4.7, totalRatings: 20, memberSince: 'Enero 2025', productsCount: 25, soldCount: 18, activeCount: 7 },
];

const mockListings = [
  { id: 1, title: 'MacBook Pro 13" M1 2020', price: 899, category: 'Electrónicos', location: 'Campus Gustavo Galindo', condition: 'Usado', rating: 4.8, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', userId: 1, views: 234, favorites: 12, status: 'active', createdAt: '2024-12-15' },
  { id: 2, title: 'Cálculo I - James Stewart (9na Ed.)', price: 35, category: 'Libros', location: 'Campus Prosperina', condition: 'Usado', rating: 4.9, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', userId: 2, views: 156, favorites: 8, status: 'active', createdAt: '2024-12-14', badge: 'NUEVO' },
  { id: 3, title: 'Bicicleta de montaña Trek 29"', price: 450, category: 'Deportes', location: 'Campus Gustavo Galindo', condition: 'Usado', rating: 4.7, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400', userId: 3, views: 198, favorites: 15, status: 'active', createdAt: '2024-12-13' },
  { id: 4, title: 'iPhone 12 Pro 128GB - Azul Pacífico', price: 550, category: 'Electrónicos', location: 'Centro Histórico', condition: 'Usado', rating: 5, image: 'https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=400', userId: 1, views: 289, favorites: 22, status: 'active', createdAt: '2024-12-12' },
  { id: 5, title: 'Escritorio de estudio con cajonera', price: 120, category: 'Muebles', location: 'Campus Gustavo Galindo', condition: 'Nuevo', rating: 4.6, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400', userId: 2, views: 145, favorites: 9, status: 'active', createdAt: '2024-12-11', badge: 'NUEVO' },
  { id: 6, title: 'Calculadora Gráfica TI-84 Plus', price: 85, category: 'Electrónicos', location: 'Campus Prosperina', condition: 'Nuevo', rating: 4.8, image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400', userId: 3, views: 98, favorites: 6, status: 'active', createdAt: '2024-12-10', badge: 'Sin usar' },
  { id: 7, title: 'Mochila North Face 40L - Trekking', price: 65, category: 'Deportes', location: 'Campus Gustavo Galindo', condition: 'Usado', rating: 4.9, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', userId: 1, views: 176, favorites: 11, status: 'active', createdAt: '2024-12-09' },
  { id: 8, title: 'Lampara de escritorio LED regulable', price: 25, category: 'Otros', location: 'Centro Histórico', condition: 'Nuevo', rating: 5, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', userId: 2, views: 87, favorites: 5, status: 'active', createdAt: '2024-12-08', badge: 'NUEVO' },
];

const categories = [
  { name: 'Libros', icon: '📚', count: 45 },
  { name: 'Electrónicos', icon: '💻', count: 78 },
  { name: 'Muebles', icon: '🪑', count: 23 },
  { name: 'Deportes', icon: '⚽', count: 34 },
  { name: 'Ropa', icon: '👕', count: 56 },
  { name: 'Otros', icon: '📦', count: 89 },
];


// ==================== COMPONENTES ====================

// Navbar
const Navbar = ({ onSearch, currentUser, onNavigate, unreadMessages = 2 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center space-x-2 hover:opacity-80">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">CampusMarket</span>
          </button>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Buscar laptops, libros, bicicletas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate('create')} className="hidden sm:flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Plus className="w-5 h-5" />
              <span>Publicar</span>
            </button>

            <button onClick={() => onNavigate('messages')} className="relative p-2 hover:bg-gray-100 rounded-full">
              <MessageCircle className="w-6 h-6 text-gray-700" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>

            <button onClick={() => onNavigate('favorites')} className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className="w-6 h-6 text-gray-700" />
            </button>

            <button onClick={() => onNavigate('profile')} className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center hover:opacity-80">
              <User className="w-5 h-5 text-gray-700" />
            </button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex space-x-6 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onNavigate('search', { category: cat.name })}
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

// Product Card
const ProductCard = ({ listing, onFavorite, isFavorited, onNavigate }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative" onClick={() => onNavigate('detail', listing)}>
        <img src={listing.image} alt={listing.title} className="w-full h-48 object-cover rounded-t-lg" />
        {listing.badge && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">{listing.badge}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(listing.id);
          }}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:scale-110 transition-transform"
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">{listing.title}</h3>
        <p className="text-2xl font-bold text-blue-600 mb-2">${listing.price.toFixed(2)}</p>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{listing.location}</span>
          <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">{listing.condition}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span>{listing.rating}</span>
          </div>
          <span>Hace {Math.floor(Math.random() * 400)} días</span>
        </div>
      </div>
    </div>
  );
};

// Hero Section
const Hero = ({ onNavigate }) => (
  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-20">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Compra y vende entre estudiantes</h1>
      <p className="text-xl mb-8">La plataforma de confianza de tu universidad</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={() => onNavigate('create')} className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center justify-center">
          Comenzar a vender
          <ChevronDown className="w-5 h-5 ml-2 rotate-[-90deg]" />
        </button>
        <button onClick={() => onNavigate('search')} className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
          Explorar productos
        </button>
      </div>
    </div>
  </div>
);

// Home Page
const HomePage = ({ onNavigate, favorites, onFavorite }) => {
  return (
    <div>
      <Hero onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Publicaciones recientes</h2>
          <button onClick={() => onNavigate('search')} className="text-blue-600 hover:underline">Ver todos</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockListings.slice(0, 8).map((listing) => (
            <ProductCard
              key={listing.id}
              listing={listing}
              isFavorited={favorites.includes(listing.id)}
              onFavorite={onFavorite}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <button onClick={() => onNavigate('search')} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200">
            Cargar más productos
          </button>
        </div>
      </div>
    </div>
  );
};

// Search/Filter Page - ALEX OTERO
const SearchPage = ({ initialFilters, favorites, onFavorite, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.query || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || 'Todas');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [condition, setCondition] = useState('Todas');
  const [location, setLocation] = useState('Todas');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredListings, setFilteredListings] = useState(mockListings);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, priceRange, condition, location]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const matches = mockListings
        .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
        .map(l => l.title);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const applyFilters = () => {
    let results = [...mockListings];

    if (searchQuery) {
      results = results.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'Todas') {
      results = results.filter(l => l.category === selectedCategory);
    }

    if (priceRange.min) {
      results = results.filter(l => l.price >= parseFloat(priceRange.min));
    }

    if (priceRange.max) {
      results = results.filter(l => l.price <= parseFloat(priceRange.max));
    }

    if (condition !== 'Todas') {
      results = results.filter(l => l.condition === condition);
    }

    if (location !== 'Todas') {
      results = results.filter(l => l.location === location);
    }

    setFilteredListings(results);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Buscar Productos</h1>

      {/* Search Bar with Suggestions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-10">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-0"
                >
                  <Search className="inline w-4 h-4 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {cat.icon} {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros
              </h2>
              <button onClick={() => {
                setSelectedCategory('Todas');
                setPriceRange({ min: '', max: '' });
                setCondition('Todas');
                setLocation('Todas');
              }} className="text-sm text-blue-600 hover:underline">
                Limpiar
              </button>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rango de Precio</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Condition */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Todas</option>
                <option>Nuevo</option>
                <option>Usado</option>
              </select>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Todas</option>
                <option>Campus Gustavo Galindo</option>
                <option>Campus Prosperina</option>
                <option>Centro Histórico</option>
              </select>
            </div>

            {/* Category Stats */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Estadísticas por Categoría</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{cat.icon} {cat.name}</span>
                    <span className="font-semibold text-gray-800">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
            <p className="text-gray-700">
              <span className="font-semibold">{filteredListings.length}</span> productos encontrados
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden text-blue-600">
                <Filter className="w-5 h-5" />
              </button>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Más recientes</option>
                <option>Precio: Menor a Mayor</option>
                <option>Precio: Mayor a Menor</option>
                <option>Mejor calificados</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                isFavorited={favorites.includes(listing.id)}
                onFavorite={onFavorite}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron productos</h3>
              <p className="text-gray-600 mb-4">Intenta ajustar tus filtros o buscar con otros términos</p>
              <button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todas');
                setPriceRange({ min: '', max: '' });
                setCondition('Todas');
                setLocation('Todas');
              }} className="text-blue-600 hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Favorites Page - ALEX OTERO
const FavoritesPage = ({ favorites, onFavorite, onNavigate }) => {
  const favoriteListings = mockListings.filter(l => favorites.includes(l.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Favoritos</h1>
      <p className="text-gray-600 mb-6">Productos que has guardado para ver más tarde</p>

      {favoriteListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteListings.map((listing) => (
            <ProductCard
              key={listing.id}
              listing={listing}
              isFavorited={true}
              onFavorite={onFavorite}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No tienes favoritos aún</h3>
          <p className="text-gray-600 mb-4">Explora productos y guarda los que te interesen</p>
          <button onClick={() => onNavigate('search')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Explorar productos
          </button>
        </div>
      )}
    </div>
  );
};

// User Profile Page - ALEX OTERO
const ProfilePage = ({ userId, onNavigate, currentUserId }) => {
  const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
  const userListings = mockListings.filter(l => l.userId === userId);
  const [activeTab, setActiveTab] = useState('publicaciones');
  const isOwnProfile = userId === currentUserId;
  const [editingListing, setEditingListing] = useState(null);
  const [listingStatuses, setListingStatuses] = useState({});
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    condition: '',
    description: ''
  });

  const handleEditClick = (listing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title,
      price: listing.price,
      condition: listing.condition,
      description: 'Descripción del producto...'
    });
  };

  const handleSaveEdit = () => {
    alert(`Publicación "${editForm.title}" actualizada correctamente - Alerta para después conectar con el backend!`);
    setEditingListing(null);
  };

  const toggleStatus = (listingId) => {
    setListingStatuses(prev => ({
      ...prev,
      [listingId]: prev[listingId] === 'paused' ? 'active' : 'paused'
    }));
  };

  const getListingStatus = (listingId) => {
    return listingStatuses[listingId] || 'active';
  };

  return (
    <div className="bg-gradient-to-b from-blue-600 to-cyan-500 pb-8">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {isOwnProfile && (
            <div className="text-right mb-4">
              <button className="text-blue-600 hover:underline flex items-center ml-auto">
                <Edit className="w-4 h-4 mr-1" />
                Editar perfil
              </button>
            </div>
          )}

          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-4xl text-gray-600">
              👤
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h1>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(user.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-2 text-gray-700 font-semibold">{user.rating}</span>
                  <span className="ml-1 text-gray-500">({user.totalRatings} calificaciones)</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Miembro desde {user.memberSince}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-t pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{user.productsCount}</p>
              <p className="text-sm text-gray-600">Productos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{user.soldCount}</p>
              <p className="text-sm text-gray-600">Vendidos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{user.activeCount}</p>
              <p className="text-sm text-gray-600">Activos</p>
            </div>
          </div>
        </div>

        {/* Modal de Edición */}
        {editingListing && (
          <div className="fixed inset-0 backdrop-blur-sm 1 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Editar Publicación</h2>
                  <button
                    onClick={() => setEditingListing(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Título *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Precio (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                    <select
                      value={editForm.condition}
                      onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Nuevo">Nuevo</option>
                      <option value="Usado">Usado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditingListing(null)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('publicaciones')}
                className={`flex-1 px-6 py-4 font-semibold ${activeTab === 'publicaciones' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              >
                Mis Publicaciones
              </button>
              <button
                onClick={() => setActiveTab('favoritos')}
                className={`flex-1 px-6 py-4 font-semibold ${activeTab === 'favoritos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              >
                Favoritos
                <span className="ml-2 text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">5</span>
              </button>
              <button
                onClick={() => setActiveTab('calificaciones')}
                className={`flex-1 px-6 py-4 font-semibold ${activeTab === 'calificaciones' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              >
                Calificaciones
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'publicaciones' && (
              <div>
                {isOwnProfile && (
                  <div className="mb-6">
                    <button onClick={() => onNavigate('create')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Publicar nuevo producto
                    </button>
                  </div>
                )}

                <div className="flex gap-3 mb-6">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Todas (2)</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Activas (2)</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Pausadas (0)</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Vendidas (0)</button>
                </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {userListings.map((listing) => {
                    const status = getListingStatus(listing.id);
                    const isPaused = status === 'paused';

                    return (
                      <div key={listing.id} className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${isPaused ? 'opacity-60' : ''}`}>
                        <div className="relative">
                          <img src={listing.image} alt={listing.title} className="w-full h-48 object-cover" />
                          <span className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}>
                            {isPaused ? 'Pausado' : 'Activo'}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-2">{listing.title}</h3>
                          <p className="text-2xl font-bold text-blue-600 mb-3">${listing.price.toFixed(2)}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {listing.views}
                            </span>
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {listing.favorites}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {Math.floor(listing.favorites / 2)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-4">Publicado hace {Math.floor(Math.random() * 400)} días</p>

                          {isOwnProfile && (
                            <div className="flex gap-2 pt-3 border-t border-gray-200">
                              <button
                                onClick={() => handleEditClick(listing)}
                                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  toggleStatus(listing.id);
                                  alert(isPaused ? 'Publicación activada - Alerta para después conectar con el backend!' : 'Publicación pausada - Alerta para después conectar con el backend!');
                                }}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${isPaused
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                  : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                  }`}
                              >
                                {isPaused ? 'Activar' : 'Pausar'}
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
                                    alert('Publicación eliminada - Alerta para después conectar con el backend!');
                                  }
                                }}
                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Detail Page
const ProductDetailPage = ({ listing, onNavigate, onFavorite, isFavorited }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [listing.image, listing.image, listing.image];
  const seller = mockUsers.find(u => u.id === listing.userId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => onNavigate('home')} className="text-blue-600 hover:underline mb-6 flex items-center">
        ← Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img src={images[currentImage]} alt={listing.title} className="w-full h-96 object-cover" />
            {listing.badge && (
              <span className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded">{listing.badge}</span>
            )}
            <button
              onClick={() => onFavorite(listing.id)}
              className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Heart className={`w-6 h-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>
          <div className="flex gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${currentImage === idx ? 'border-blue-600' : 'border-gray-200'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{listing.title}</h1>
          <p className="text-4xl font-bold text-blue-600 mb-6">${listing.price.toFixed(2)}</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Estado:</span>
              <span className="font-semibold text-gray-800">{listing.condition}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Categoría:</span>
              <span className="font-semibold text-gray-800">{listing.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ubicación:</span>
              <span className="font-semibold text-gray-800 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {listing.location}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Publicado:</span>
              <span className="font-semibold text-gray-800">Hace 397 días</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Descripción</h3>
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Producto en excelentes condiciones,
              muy bien cuidado. Incluye cargador original y caja. Sin rayones ni golpes.
              Perfecto para estudiantes que necesitan un equipo confiable para sus estudios.
            </p>
          </div>

          {/* Seller Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Vendedor</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{seller.name}</p>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span>{seller.rating}</span>
                  <span className="text-gray-500 ml-1">({seller.totalRatings} calificaciones)</span>
                </div>
              </div>
              <button onClick={() => onNavigate('profile', seller)} className="text-blue-600 hover:underline text-sm">
                Ver perfil
              </button>
            </div>
          </div>

          <button onClick={() => onNavigate('messages')} className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center mb-3">
            <MessageCircle className="w-5 h-5 mr-2" />
            Contactar vendedor
          </button>
          <button onClick={() => onFavorite(listing.id)} className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center">
            <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            {isFavorited ? 'Guardado en favoritos' : 'Guardar en favoritos'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Messages Page
const MessagesPage = ({ onNavigate }) => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

  const chats = [
    { id: 1, user: 'Jose Chong', lastMessage: 'Hola! ¿Está disponible la laptop?', time: 'Hace 5 min', unread: 2, product: 'MacBook Pro 13" M1 2020', online: true },
    { id: 2, user: 'Alex Otero', lastMessage: 'Perfecto, nos vemos mañana entonces', time: 'Hace 2 horas', unread: 0, product: 'Cálculo I - James Stewart', online: false },
    { id: 3, user: 'María González', lastMessage: 'Gracias por la compra!', time: 'Ayer', unread: 0, product: null, online: false },
  ];

  const messages = [
    { id: 1, text: 'Hola! Me interesa la MacBook', sender: 'them', time: '10:00' },
    { id: 2, text: 'Hola! Claro, está disponible. ¿Tienes alguna pregunta?', sender: 'me', time: '10:05' },
    { id: 3, text: '¿Incluye la caja original?', sender: 'them', time: '10:10' },
    { id: 4, text: 'No incluye la caja, pero si el cargador original y una funda', sender: 'me', time: '10:15' },
    { id: 5, text: 'Hola! ¿Está disponible la laptop?', sender: 'them', time: '14:55' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mensajes</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar conversación..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-4 border-b hover:bg-gray-50 text-left ${selectedChat === chat.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      {chat.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-800 truncate">{chat.user}</p>
                        <span className="text-xs text-gray-500">{chat.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                      {chat.product && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-8 h-8 bg-purple-600 rounded flex-shrink-0" />
                          <p className="text-xs text-gray-500 truncate">{chat.product}</p>
                        </div>
                      )}
                    </div>
                    {chat.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <p className="font-semibold text-gray-800">Jose Chong</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                    En línea
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                  <div className="w-10 h-10 bg-purple-600 rounded" />
                  <span className="text-sm text-gray-700">MacBook Pro 13" M1 2020</span>
                  <button onClick={() => onNavigate('detail', mockListings[0])} className="text-blue-600 hover:underline text-sm">
                    Ver producto
                  </button>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded">⋮</button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              <div className="text-center text-xs text-gray-500 mb-4">12 de diciembre de 2024</div>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'them' && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex-shrink-0" />
                  )}
                  <div className={`max-w-md px-4 py-2 rounded-lg ${msg.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`}>
                    <p>{msg.text}</p>
                    <div className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-blue-100 text-right' : 'text-gray-500'}`}>
                      {msg.time} {msg.sender === 'me' && '✓✓'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded">
                  📎
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribir mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="p-2 hover:bg-gray-100 rounded">
                  😊
                </button>
                <button className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Listing Page
const CreateListingPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    condition: 'Nuevo',
    description: '',
    location: '',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => onNavigate('home')} className="text-blue-600 hover:underline mb-6 flex items-center">
        ← Volver
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Publicar nuevo producto</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Información básica</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título del producto *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder='Ej: MacBook Pro 13" M1 2020'
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">0/80 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Precio (USD) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado del producto *</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="condition"
                      value="Nuevo"
                      checked={formData.condition === 'Nuevo'}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="mr-2"
                    />
                    <span>Nuevo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="condition"
                      value="Usado"
                      checked={formData.condition === 'Usado'}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="mr-2"
                    />
                    <span>Usado</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Descripción detallada</h2>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe tu producto: condiciones, tiempo de uso, accesorios incluidos..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">0/1000 caracteres</p>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Fotografías</h2>
            <p className="text-sm text-gray-600 mb-4">Agrega hasta 5 fotos (JPG, PNG - máx 5MB cada una)</p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer">
              <div className="text-gray-400 mb-2">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  ⬆️
                </div>
              </div>
              <p className="text-gray-700 font-medium mb-1">Arrastra imágenes aquí</p>
              <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Seleccionar archivos
              </button>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ubicación de entrega</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Campus / Lugar de encuentro *</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un lugar</option>
                <option>Campus Gustavo Galindo</option>
                <option>Campus Prosperina</option>
                <option>Centro Histórico</option>
              </select>
              <label className="flex items-center mt-3">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Acepto entregas en otro campus (coordinado)</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">He leído y acepto los <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a> *</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Vista previa
            </button>
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Guardar como borrador
            </button>
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center">
              ✓ Publicar producto
            </button>
          </div>
        </div>

        {/* Tips Sidebar */}
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
              💡 Consejos para vender rápido
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Usa fotos con buena iluminación</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Describe todos los detalles importantes</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Establece un precio competitivo</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Responde rápido a los mensajes</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Sé honesto sobre el estado del producto</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-800 mb-2">💡 ¿Sabías que...?</h3>
            <p className="text-sm text-blue-800">
              Los productos con buena descripción y fotos se venden 3 veces más rápido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer
const Footer = () => (
  <footer className="bg-gray-100 border-t mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Acerca de</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-blue-600">¿Quiénes somos?</a></li>
            <li><a href="#" className="hover:text-blue-600">Cómo funciona</a></li>
            <li><a href="#" className="hover:text-blue-600">Blog</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Soporte</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-blue-600">Centro de ayuda</a></li>
            <li><a href="#" className="hover:text-blue-600">Términos y condiciones</a></li>
            <li><a href="#" className="hover:text-blue-600">Privacidad</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Comunidad</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-blue-600">Consejos de venta</a></li>
            <li><a href="#" className="hover:text-blue-600">Seguridad</a></li>
            <li><a href="#" className="hover:text-blue-600">Contacto</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Síguenos</h3>
          <div className="flex gap-4 text-gray-600">
            <a href="#" className="hover:text-blue-600 text-2xl">f</a>
            <a href="#" className="hover:text-blue-600 text-2xl">📷</a>
          </div>
        </div>
      </div>
      <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
        © 2025 CampusMarket. Todos los derechos reservados.
      </div>
    </div>
  </footer>
);

// Main App
export default function ExPolApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [favorites, setFavorites] = useState([1, 3, 6]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchFilters, setSearchFilters] = useState(null);

  const currentUser = mockUsers[0];

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    if (page === 'detail') {
      setSelectedListing(data);
    } else if (page === 'profile') {
      setSelectedUser(data || currentUser);
    } else if (page === 'search') {
      setSearchFilters(data);
    }
    window.scrollTo(0, 0);
  };

  const handleSearch = (query) => {
    handleNavigate('search', { query });
  };

  const handleFavorite = (listingId) => {
    setFavorites(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        onSearch={handleSearch}
        currentUser={currentUser}
        onNavigate={handleNavigate}
      />

      {currentPage === 'home' && (
        <HomePage
          onNavigate={handleNavigate}
          favorites={favorites}
          onFavorite={handleFavorite}
        />
      )}

      {currentPage === 'search' && (
        <SearchPage
          initialFilters={searchFilters}
          favorites={favorites}
          onFavorite={handleFavorite}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'favorites' && (
        <FavoritesPage
          favorites={favorites}
          onFavorite={handleFavorite}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          userId={selectedUser?.id || currentUser.id}
          onNavigate={handleNavigate}
          currentUserId={currentUser.id}
        />
      )}

      {currentPage === 'detail' && selectedListing && (
        <ProductDetailPage
          listing={selectedListing}
          onNavigate={handleNavigate}
          onFavorite={handleFavorite}
          isFavorited={favorites.includes(selectedListing.id)}
        />
      )}

      {currentPage === 'messages' && (
        <MessagesPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'create' && (
        <CreateListingPage onNavigate={handleNavigate} />
      )}

      <Footer />
    </div>
  );
}