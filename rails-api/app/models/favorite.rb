# app/models/favorite.rb
class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :listing, counter_cache: true
  
  validates :user_id, uniqueness: { scope: :listing_id }
  
  after_create :increment_listing_favorites
  after_destroy :decrement_listing_favorites
  
  private
  
  def increment_listing_favorites
    listing.increment!(:favorites_count) if listing.respond_to?(:favorites_count)
  end
  
  def decrement_listing_favorites
    listing.decrement!(:favorites_count) if listing.respond_to?(:favorites_count)
  end
end