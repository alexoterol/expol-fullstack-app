# rails-api/app/models/listing.rb
class Listing < ApplicationRecord
  belongs_to :user
  # has_many_attached :images
  has_many :favorites, dependent: :destroy
  has_many :ratings, dependent: :destroy
  
  CATEGORIES = ['Libros', 'Electrónicos', 'Muebles', 'Deportes', 'Otros'].freeze
  STATES = ['nuevo', 'usado'].freeze
  STATUSES = ['active', 'paused', 'sold'].freeze
  
  validates :title, presence: true, length: { minimum: 5, maximum: 100 }
  validates :description, presence: true, length: { minimum: 20, maximum: 1000 }
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :state, presence: true, inclusion: { in: STATES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :location, presence: true
  
  # Scopes existentes
  scope :active, -> { where(status: 'active') }
  scope :recent, -> { order(created_at: :desc) }
  
  # Scopes nuevos para búsqueda avanzada
  scope :search_by_text, ->(query) {
    where('title ILIKE ? OR description ILIKE ?', "%#{query}%", "%#{query}%")
  }
  
  scope :by_category, ->(category) {
    where(category: category)
  }
  
  scope :by_price_range, ->(min_price, max_price) {
    where(price: min_price..max_price)
  }
  
  scope :by_state, ->(state) {
    where(state: state)
  }
  
  scope :by_location, ->(location) {
    where('location ILIKE ?', "%#{location}%")
  }
end