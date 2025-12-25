# app/models/user.rb
class User < ApplicationRecord
  has_secure_password
  
  has_many :listings, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :favorited_listings, through: :favorites, source: :listing
  has_many :ratings_given, class_name: 'Rating', foreign_key: 'rater_id', dependent: :destroy
  has_many :ratings_received, class_name: 'Rating', dependent: :destroy
  
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  
  def average_rating
    ratings_received.average(:score) || 0
  end
  
  def completed_sales
    listings.where(status: 'sold').count
  end
end