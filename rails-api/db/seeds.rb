# rails-api/db/seeds.rb
puts "🌱 Sembrando base de datos..."

# Limpiar datos
Listing.destroy_all
User.destroy_all

# Crear usuarios
puts "👥 Creando usuarios..."

users = []

users << User.create!(
  name: "Alexandre Icaza",
  email: "alexandre.icaza@espol.edu.ec",
  password: "password123",
  password_confirmation: "password123",
  verified: true
)

users << User.create!(
  name: "José Chong",
  email: "jose.chong@espol.edu.ec",
  password: "password123",
  password_confirmation: "password123",
  verified: true
)

users << User.create!(
  name: "Alex Otero",
  email: "alex.otero@espol.edu.ec",
  password: "password123",
  password_confirmation: "password123",
  verified: true
)

5.times do |i|
  users << User.create!(
    name: "Usuario #{i+1}",
    email: "usuario#{i+1}@espol.edu.ec",
    password: "password123",
    password_confirmation: "password123",
    verified: true
  )
end

puts "✅ #{User.count} usuarios creados"

# Crear publicaciones
puts "📝 Creando publicaciones..."

sample_listings = [
  {
    title: "Cálculo de una Variable - James Stewart",
    description: "Libro de Cálculo en excelente estado. Usado solo un semestre. Incluye soluciones a ejercicios seleccionados.",
    price: 25.00,
    category: "Libros",
    state: "usado",
    location: "FIEC"
  },
  {
    title: "Laptop HP Pavilion 15",
    description: "Laptop HP Pavilion 15, Intel Core i5 10ma gen, 8GB RAM, 256GB SSD. Ideal para programación y uso universitario.",
    price: 450.00,
    category: "Electrónicos",
    state: "usado",
    location: "FIMCP"
  },
  {
    title: "Calculadora Científica Casio fx-991",
    description: "Calculadora científica Casio fx-991ES PLUS. Prácticamente nueva, con manual incluido.",
    price: 15.00,
    category: "Electrónicos",
    state: "nuevo",
    location: "FCNM"
  },
  {
    title: "Mesa de Estudio Plegable",
    description: "Mesa de estudio plegable en madera, ideal para espacios pequeños. Medidas: 80x60cm.",
    price: 35.00,
    category: "Muebles",
    state: "usado",
    location: "EDCOM"
  },
  {
    title: "Balón de Fútbol Nike",
    description: "Balón de fútbol Nike #5, poco uso. Perfecto para jugar en el coliseo o canchas de la ESPOL.",
    price: 18.00,
    category: "Deportes",
    state: "usado",
    location: "Coliseo"
  }
]

sample_listings.each do |listing_data|
  user = users.sample
  listing = user.listings.create!(listing_data)
  listing.update(views_count: rand(0..50))
  puts "  ✓ #{listing.title}"
end

# Crear más publicaciones aleatorias
15.times do
  user = users.sample
  categories = ['Libros', 'Electrónicos', 'Muebles', 'Deportes', 'Otros']
  states = ['nuevo', 'usado']
  locations = ['FIEC', 'FIMCP', 'FCNM', 'EDCOM', 'Coliseo']
  
  user.listings.create!(
    title: "Producto #{rand(100..999)}",
    description: "Esta es una descripción de prueba para el producto. Contiene información detallada sobre el artículo en venta.",
    price: rand(5.0..200.0).round(2),
    category: categories.sample,
    state: states.sample,
    location: locations.sample,
    views_count: rand(0..100)
  )
end

puts "✅ #{Listing.count} publicaciones creadas"
puts ""
puts "🎉 ¡Base de datos lista!"
puts "🔑 Credenciales: alexandre.icaza@espol.edu.ec / password123"