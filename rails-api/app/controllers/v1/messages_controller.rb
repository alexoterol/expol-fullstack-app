# app/controllers/v1/messages_controller.rb
# Responsable: José Chong
# Funcionalidades: Envío de mensajes en tiempo real

module V1
  class MessagesController < ApplicationController
    before_action :authenticate_user!
    before_action :set_conversation

    # POST /api/v1/conversations/:conversation_id/messages
    # Enviar un mensaje
    def create
      @message = @conversation.messages.build(
        user_id: current_user.id,
        content: params[:content]
      )

      if @message.save
        # Publicar en Redis para que Go lo distribuya via WebSocket
        publish_to_websocket(@message)

        render json: {
          message: message_json(@message)
        }, status: :created
      else
        render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PATCH /api/v1/conversations/:conversation_id/messages/mark_read
    # Marcar todos los mensajes de la conversación como leídos
    def mark_read
      @conversation.messages
                   .where.not(user_id: current_user.id)
                   .where(read: false)
                   .update_all(read: true)

      render json: { message: 'Mensajes marcados como leídos' }, status: :ok
    end

    private

    def set_conversation
      @conversation = Conversation.for_user(current_user.id).find(params[:conversation_id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Conversación no encontrada' }, status: :not_found
    end

    def message_json(message)
      {
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        read: message.read,
        is_mine: true,
        user: {
          id: message.user.id,
          name: message.user.name
        }
      }
    end

    def publish_to_websocket(message)
      # Determinar el destinatario
      recipient_id = if @conversation.buyer_id == current_user.id
                       @conversation.seller_id
                     else
                       @conversation.buyer_id
                     end

      # Preparar payload para Redis/Go
      payload = {
        message_id: "msg_#{message.id}",
        conversation_id: @conversation.id,
        user_id: current_user.id,
        recipient_id: recipient_id,
        content: message.content,
        created_at: message.created_at,
        type: 'message',
        listing: {
          id: @conversation.listing.id,
          title: @conversation.listing.title
        },
        sender: {
          id: current_user.id,
          name: current_user.name
        }
      }

      # Publicar en Redis
      begin
        redis = Redis.new(url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0'))
        redis.publish('new_message', payload.to_json)
        redis.close
      rescue => e
        Rails.logger.error "Error publishing to Redis: #{e.message}"
      end
    end
  end
end
