# app/controllers/v1/conversations_controller.rb
# Responsable: José Chong
# Funcionalidades: Sistema de Chat y Gestión de Conversaciones

module V1
  class ConversationsController < ApplicationController
    before_action :authenticate_user!
    before_action :set_conversation, only: [:show]

    # GET /api/v1/conversations
    # Listar todas las conversaciones del usuario ordenadas por última actividad
    def index
      @conversations = Conversation.for_user(current_user.id)
                                   .recent_activity
                                   .includes(:buyer, :seller, :listing, :messages)

      render json: {
        conversations: @conversations.map { |conv| conversation_json(conv) }
      }, status: :ok
    end

    # GET /api/v1/conversations/:id
    # Ver conversación con historial de mensajes
    def show
      # Marcar mensajes como leídos
      @conversation.messages
                   .where.not(user_id: current_user.id)
                   .where(read: false)
                   .update_all(read: true)

      render json: {
        conversation: conversation_json(@conversation, include_messages: true)
      }, status: :ok
    end

    # POST /api/v1/conversations
    # Crear o obtener conversación existente (al contactar vendedor)
    def create
      listing = Listing.find(params[:listing_id])
      
      # No puede crear conversación consigo mismo
      if listing.user_id == current_user.id
        return render json: { error: 'No puedes iniciar conversación con tu propia publicación' }, status: :unprocessable_entity
      end

      # Buscar conversación existente o crear nueva
      @conversation = Conversation.find_or_initialize_by(
        buyer_id: current_user.id,
        seller_id: listing.user_id,
        listing_id: listing.id
      )

      if @conversation.new_record?
        if @conversation.save
          render json: {
            message: 'Conversación creada',
            conversation: conversation_json(@conversation)
          }, status: :created
        else
          render json: { errors: @conversation.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render json: {
          message: 'Conversación existente',
          conversation: conversation_json(@conversation, include_messages: true)
        }, status: :ok
      end
    end

    private

    def set_conversation
      @conversation = Conversation.for_user(current_user.id).find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Conversación no encontrada' }, status: :not_found
    end

    def conversation_json(conversation, include_messages: false)
      other = conversation.other_user(current_user.id)
      last_msg = conversation.last_message
      
      result = {
        id: conversation.id,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        unread_count: conversation.unread_count(current_user.id),
        other_user: {
          id: other.id,
          name: other.name,
          email: other.email
        },
        listing: {
          id: conversation.listing.id,
          title: conversation.listing.title,
          price: conversation.listing.price,
          category: conversation.listing.category
        },
        last_message: last_msg ? {
          id: last_msg.id,
          content: last_msg.content.truncate(50),
          created_at: last_msg.created_at,
          is_mine: last_msg.user_id == current_user.id
        } : nil
      }

      if include_messages
        result[:messages] = conversation.messages.order(created_at: :asc).map do |msg|
          {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            read: msg.read,
            is_mine: msg.user_id == current_user.id,
            user: {
              id: msg.user.id,
              name: msg.user.name
            }
          }
        end
      end

      result
    end
  end
end
