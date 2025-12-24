# app/controllers/api/v1/search_controller.rb
# Responsable: Alex Otero
# Funcionalidades: Búsqueda Avanzada de Publicaciones

module Api
  module V1
    class SearchController < ApplicationController
      # GET /api/v1/search
      # Búsqueda avanzada con múltiples filtros
      def index
        @listings = Listing.active.includes(:user, images_attachments: :blob)
        
        # Búsqueda por texto libre
        if params[:query].present?
          @listings = @listings.search_by_text(params[:query])
        end
        
        # Filtro por categoría
        if params[:category].present?
          @listings = @listings.by_category(params[:category])
        end
        
        # Filtro por rango de precio
        if params[:min_price].present? || params[:max_price].present?
          min = params[:min_price].to_f || 0
          max = params[:max_price].to_f || Float::INFINITY
          @listings = @listings.by_price_range(min, max)
        end
        
        # Filtro por estado del producto
        if params[:state].present?
          @listings = @listings.by_state(params[:state])
        end
        
        # Filtro por ubicación
        if params[:location].present?
          @listings = @listings.by_location(params[:location])
        end
        
        # Filtro por fecha de publicación
        if params[:days_ago].present?
          days = params[:days_ago].to_i
          @listings = @listings.where('created_at >= ?', days.days.ago)
        end
        
        # Ordenamiento
        @listings = apply_sorting(@listings, params[:sort_by])
        
        # Paginación
        @listings = @listings.page(params[:page] || 1).per(params[:per_page] || 20)
        
        render json: {
          listings: @listings.map { |listing| listing_json(listing) },
          filters_applied: {
            query: params[:query],
            category: params[:category],
            price_range: {
              min: params[:min_price],
              max: params[:max_price]
            },
            state: params[:state],
            location: params[:location],
            days_ago: params[:days_ago],
            sort_by: params[:sort_by]
          },
          meta: {
            current_page: @listings.current_page,
            total_pages: @listings.total_pages,
            total_count: @listings.total_count,
            per_page: @listings.limit_value
          }
        }, status: :ok
      end
      
      # GET /api/v1/search/suggestions
      # Obtener sugerencias de búsqueda
      def suggestions
        query = params[:query]
        
        if query.blank?
          return render json: { suggestions: [] }, status: :ok
        end
        
        # Buscar títulos similares
        titles = Listing.active
                       .where('title ILIKE ?', "%#{query}%")
                       .limit(5)
                       .pluck(:title)
                       .uniq
        
        render json: {
          suggestions: titles
        }, status: :ok
      end
      
      # GET /api/v1/search/categories_stats
      # Estadísticas por categoría
      def categories_stats
        stats = Listing.active
                      .group(:category)
                      .count
        
        render json: {
          categories: Listing::CATEGORIES.map do |category|
            {
              name: category,
              count: stats[category] || 0
            }
          end
        }, status: :ok
      end
      
      private
      
      def apply_sorting(listings, sort_by)
        case sort_by
        when 'price_asc'
          listings.order(price: :asc)
        when 'price_desc'
          listings.order(price: :desc)
        when 'oldest'
          listings.order(created_at: :asc)
        when 'most_viewed'
          listings.order(views_count: :desc)
        when 'most_favorited'
          listings.order(favorites_count: :desc)
        else
          listings.recent
        end
      end
      
      def listing_json(listing)
        {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          state: listing.state,
          location: listing.location,
          created_at: listing.created_at,
          views_count: listing.views_count || 0,
          favorites_count: listing.favorites_count || 0,
          user: {
            id: listing.user.id,
            name: listing.user.name,
            average_rating: listing.user.average_rating
          },
          main_image_url: listing.images.first ? url_for(listing.images.first) : nil
        }
      end
    end
  end
end

# app/controllers/api/v1/favorites_controller.rb
# Responsable: Alex Otero
# Funcionalidades: Sistema de Favoritos

module Api
  module V1
    class FavoritesController < ApplicationController
      before_action :authenticate_user!
      before_action :set_listing, only: [:create]
      before_action :set_favorite, only: [:destroy]
      
      # GET /api/v1/favorites
      # Listar todos los favoritos del usuario
      def index
        @favorites = current_user.favorites
                                .includes(listing: [:user, images_attachments: :blob])
                                .order(created_at: :desc)
                                .page(params[:page] || 1)
                                .per(params[:per_page] || 20)
        
        # Filtrar por categoría si se especifica
        if params[:category].present?
          @favorites = @favorites.joins(:listing)
                                 .where(listings: { category: params[:category] })
        end
        
        render json: {
          favorites: @favorites.map { |fav| favorite_json(fav) },
          meta: {
            current_page: @favorites.current_page,
            total_pages: @favorites.total_pages,
            total_count: @favorites.total_count
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
              name: listing.user.name,
              average_rating: listing.user.average_rating
            },
            main_image_url: listing.images.first ? url_for(listing.images.first) : nil
          }
        }
      end
    end
  end
end

# app/controllers/api/v1/users_controller.rb
# Responsable: Alex Otero
# Funcionalidades: Ver Perfil de Usuario

module Api
  module V1
    class UsersController < ApplicationController
      before_action :set_user, only: [:show, :ratings]
      
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
        @user = User.find(params[:id])
        @listings = @user.listings
                        .active
                        .includes(images_attachments: :blob)
                        .order(created_at: :desc)
                        .page(params[:page] || 1)
                        .per(params[:per_page] || 20)
        
        render json: {
          listings: @listings.map { |listing| listing_json(listing) },
          meta: {
            current_page: @listings.current_page,
            total_pages: @listings.total_pages,
            total_count: @listings.total_count
          }
        }, status: :ok
      end
      
      # GET /api/v1/users/:id/ratings
      # Ver calificaciones recibidas por un usuario
      def ratings
        @ratings = @user.ratings_received
                       .includes(:rater, :listing)
                       .order(created_at: :desc)
                       .page(params[:page] || 1)
                       .per(params[:per_page] || 10)
        
        render json: {
          ratings: @ratings.map { |rating| rating_json(rating) },
          average_rating: @user.average_rating,
          total_ratings: @user.ratings_received.count,
          meta: {
            current_page: @ratings.current_page,
            total_pages: @ratings.total_pages
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
        params.require(:user).permit(:name, :phone, :bio, :avatar)
      end
      
      def user_profile_json(user, include_private: false)
        json = {
          id: user.id,
          name: user.name,
          email: user.email,
          average_rating: user.average_rating.round(2),
          total_ratings: user.ratings_received.count,
          completed_sales: user.completed_sales,
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
          created_at: listing.created_at,
          main_image_url: listing.images.first ? url_for(listing.images.first) : nil
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
end