# app/models/conversation.rb
class Conversation < ApplicationRecord
  belongs_to :buyer, class_name: 'User'
  belongs_to :seller, class_name: 'User'
  belongs_to :listing
  has_many :messages, dependent: :destroy
  
  validates :buyer_id, uniqueness: { scope: [:seller_id, :listing_id] }
  
  scope :for_user, ->(user_id) { where('buyer_id = ? OR seller_id = ?', user_id, user_id) }
  scope :recent_activity, -> { order(updated_at: :desc) }
  
  def other_user(current_user_id)
    buyer_id == current_user_id ? seller : buyer
  end
  
  def last_message
    messages.order(created_at: :desc).first
  end
  
  def unread_count(user_id)
    messages.where.not(user_id: user_id).where(read: false).count
  end
end