# rails-api/app/models/user.rb
class User < ApplicationRecord
  has_secure_password
  has_many :listings, dependent: :destroy
  
  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
end
