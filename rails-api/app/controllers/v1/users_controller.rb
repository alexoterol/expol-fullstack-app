# app/controllers/v1/users_controller.rb
# Responsable: Alex Otero
# Funcionalidades: Ver Perfil de Usuario

module V1
  class UsersController < ApplicationController
    before_action :set_user, only: [:show, :ratings, :listings]
    
    # GET /api/v1/users/:id/profile
    # Ver perfil público de un usuario
    def show
      render json: {
        user: user_profile_json(@user),
        is_own_profile: current_user&.id == @user.id
      }, status: :ok
    end
    
    # GET /api/v1/users/:id/listings
    # Ver publicaciones activas de un usuario
    def listings
      @listings = @user.listings
                      .active
                      .order(created_at: :desc)
      
      page = params[:page] || 1
      per_page = params[:per_page] || 20
      @listings = @listings.limit(per_page).offset((page.to_i - 1) * per_page.to_i)
      total_count = @user.listings.active.count
      
      render json: {
        listings: @listings.map { |listing| listing_json(listing) },
        meta: {
          current_page: page.to_i,
          total_pages: (total_count.to_f / per_page.to_i).ceil,
          total_count: total_count
        }
      }, status: :ok
    end
    
    # GET /api/v1/users/:id/ratings
    # Ver calificaciones recibidas por un usuario
    def ratings
      @ratings = @user.ratings_received
                     .includes(:rater, :listing)
                     .order(created_at: :desc)
      
      page = params[:page] || 1
      per_page = params[:per_page] || 10
      @ratings = @ratings.limit(per_page).offset((page.to_i - 1) * per_page.to_i)
      total_count = @user.ratings_received.count
      
      render json: {
        ratings: @ratings.map { |rating| rating_json(rating) },
        average_rating: @user.average_rating,
        total_ratings: total_count,
        meta: {
          current_page: page.to_i,
          total_pages: (total_count.to_f / per_page.to_i).ceil
        }
      }, status: :ok
    end
    
    # GET /api/v1/users/me
    # Ver perfil del usuario actual
    def me
      return render json: { error: 'No autenticado' }, status: :unauthorized unless current_user
      
      render json: {
        user: user_profile_json(current_user, include_private: true)
      }, status: :ok
    end
    
    # PATCH /api/v1/users/me
    # Actualizar perfil del usuario actual
    def update_me
      return render json: { error: 'No autenticado' }, status: :unauthorized unless current_user
      
      if current_user.update(user_params)
        render json: {
          message: 'Perfil actualizado exitosamente',
          user: user_profile_json(current_user, include_private: true)
        }, status: :ok
      else
        render json: {
          errors: current_user.errors.full_messages
        }, status: :unprocessable_entity
      end
    end
    
    private
    
    def set_user
      @user = User.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Usuario no encontrado' }, status: :not_found
    end
    
    def user_params
      params.require(:user).permit(:name, :phone, :bio)
    end
    
    def user_profile_json(user, include_private: false)
      json = {
        id: user.id,
        name: user.name,
        email: user.email,
        average_rating: user.average_rating || 0,
        total_ratings: user.ratings_received.count,
        completed_sales: user.completed_sales || 0,
        active_listings_count: user.listings.active.count,
        member_since: user.created_at,
        verified: user.verified || false
      }
      
      if include_private
        json.merge!({
          phone: user.phone,
          bio: user.bio,
          total_favorites: user.favorites.count
        })
      end
      
      json
    end
    
    def listing_json(listing)
      {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        category: listing.category,
        state: listing.state,
        location: listing.location,
        created_at: listing.created_at
      }
    end
    
    def rating_json(rating)
      {
        id: rating.id,
        score: rating.score,
        comment: rating.comment,
        created_at: rating.created_at,
        rater: {
          id: rating.rater.id,
          name: rating.rater.name
        },
        listing: {
          id: rating.listing.id,
          title: rating.listing.title
        }
      }
    end
  end
end