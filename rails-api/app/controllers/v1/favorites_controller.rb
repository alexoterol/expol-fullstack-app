# app/controllers/v1/favorites_controller.rb
# Responsable: Alex Otero
# Funcionalidades: Sistema de Favoritos

module V1
  class FavoritesController < ApplicationController
    before_action :authenticate_user!
    before_action :set_listing, only: [:create]
    before_action :set_favorite, only: [:destroy]
    
    # GET /api/v1/favorites
    # Listar todos los favoritos del usuario
    def index
      @favorites = current_user.favorites
                              .includes(:listing)
                              .order(created_at: :desc)
      
      # Filtrar por categoría si se especifica
      if params[:category].present?
        @favorites = @favorites.joins(:listing)
                               .where(listings: { category: params[:category] })
      end
      
      page = params[:page] || 1
      per_page = params[:per_page] || 20
      @favorites = @favorites.limit(per_page).offset((page.to_i - 1) * per_page.to_i)
      total_count = current_user.favorites.count
      
      render json: {
        favorites: @favorites.map { |fav| favorite_json(fav) },
        meta: {
          current_page: page.to_i,
          total_pages: (total_count.to_f / per_page.to_i).ceil,
          total_count: total_count
        }
      }, status: :ok
    end
    
    # POST /api/v1/favorites
    # Agregar publicación a favoritos
    def create
      # Verificar que no sea la propia publicación
      if @listing.user_id == current_user.id
        return render json: {
          error: 'No puedes agregar tu propia publicación a favoritos'
        }, status: :unprocessable_entity
      end
      
      # Verificar si ya existe
      existing_favorite = current_user.favorites.find_by(listing_id: @listing.id)
      
      if existing_favorite
        return render json: {
          message: 'Esta publicación ya está en tus favoritos',
          favorite: favorite_json(existing_favorite)
        }, status: :ok
      end
      
      @favorite = current_user.favorites.build(listing_id: @listing.id)
      
      if @favorite.save
        render json: {
          message: 'Publicación agregada a favoritos',
          favorite: favorite_json(@favorite)
        }, status: :created
      else
        render json: {
          errors: @favorite.errors.full_messages
        }, status: :unprocessable_entity
      end
    end
    
    # DELETE /api/v1/favorites/:id
    # Quitar publicación de favoritos
    def destroy
      if @favorite.destroy
        render json: {
          message: 'Publicación eliminada de favoritos'
        }, status: :ok
      else
        render json: {
          errors: ['No se pudo eliminar de favoritos']
        }, status: :unprocessable_entity
      end
    end
    
    # DELETE /api/v1/favorites/remove_by_listing/:listing_id
    # Quitar favorito por ID de publicación (alternativa)
    def remove_by_listing
      @favorite = current_user.favorites.find_by(listing_id: params[:listing_id])
      
      if @favorite.nil?
        return render json: {
          error: 'Esta publicación no está en tus favoritos'
        }, status: :not_found
      end
      
      if @favorite.destroy
        render json: {
          message: 'Publicación eliminada de favoritos'
        }, status: :ok
      else
        render json: {
          errors: ['No se pudo eliminar de favoritos']
        }, status: :unprocessable_entity
        end
    end
    
    # GET /api/v1/favorites/check/:listing_id
    # Verificar si una publicación está en favoritos
    def check
      is_favorited = current_user.favorites.exists?(listing_id: params[:listing_id])
      
      render json: {
        is_favorited: is_favorited,
        listing_id: params[:listing_id]
      }, status: :ok
    end
    
    private
    
    def set_listing
      @listing = Listing.find(params[:listing_id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Publicación no encontrada' }, status: :not_found
    end
    
    def set_favorite
      @favorite = current_user.favorites.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Favorito no encontrado' }, status: :not_found
    end
    
    def favorite_json(favorite)
      listing = favorite.listing
      
      {
        id: favorite.id,
        created_at: favorite.created_at,
        listing: {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          state: listing.state,
          status: listing.status,
          location: listing.location,
          created_at: listing.created_at,
          user: {
            id: listing.user.id,
            name: listing.user.name
          }
        }
      }
    end
  end
end