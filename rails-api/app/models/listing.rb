# rails-api/app/models/listing.rb
class Listing < ApplicationRecord
  belongs_to :user
  
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
  
  scope :active, -> { where(status: 'active') }
  scope :recent, -> { order(created_at: :desc) }
end