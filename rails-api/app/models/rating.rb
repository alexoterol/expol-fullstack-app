# app/models/rating.rb
class Rating < ApplicationRecord
  belongs_to :rater, class_name: 'User'
  belongs_to :rated_user, class_name: 'User'
  belongs_to :listing
  
  validates :score, presence: true, inclusion: { in: 1..5 }
  validates :comment, length: { maximum: 500 }
  validates :rater_id, uniqueness: { scope: [:rated_user_id, :listing_id] }
  
  after_create :update_user_rating
  
  private
  
  def update_user_rating
    rated_user.update(average_rating: rated_user.ratings_received.average(:score))
  end
end