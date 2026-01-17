# app/models/message.rb
class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :user
  
  validates :content, presence: true, length: { maximum: 1000 }
  
  after_create :update_conversation_timestamp
  
  scope :unread, -> { where(read: false) }
  scope :for_user, ->(user_id) { where.not(user_id: user_id) }
  
  private
  
  def update_conversation_timestamp
    conversation.touch
  end
end
