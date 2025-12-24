# app/models/message.rb
class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :user
  
  validates :content, presence: true, length: { maximum: 1000 }
  
  after_create :update_conversation_timestamp
  after_create_commit :broadcast_message
  
  scope :unread, -> { where(read: false) }
  scope :for_user, ->(user_id) { where.not(user_id: user_id) }
  
  private
  
  def update_conversation_timestamp
    conversation.touch
  end
  
  def broadcast_message
    # Aquí se integraría con el servicio Go de WebSocket
    # Por ahora solo actualizamos Redis para que Go lo detecte
  end
end