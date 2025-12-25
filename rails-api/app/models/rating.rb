# app/models/rating.rb
class Rating < ApplicationRecord
  belongs_to :user
  belongs_to :listing
  belongs_to :rater, class_name: 'User'
  
  validates :score, presence: true, inclusion: { in: 1..5 }
end