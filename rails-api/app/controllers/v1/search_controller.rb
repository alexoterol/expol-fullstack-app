# app/controllers/v1/search_controller.rb
# Responsable: Alex Otero
# Funcionalidades: Búsqueda Avanzada de Publicaciones

module V1
  class SearchController < ApplicationController
    # GET /api/v1/search
    # Búsqueda avanzada con múltiples filtros
    def index
      @listings = Listing.active
      
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
      page = params[:page] || 1
      per_page = params[:per_page] || 20
      @listings = @listings.limit(per_page).offset((page.to_i - 1) * per_page.to_i)
      total_count = @listings.count
      
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
          current_page: page.to_i,
          total_pages: (total_count.to_f / per_page.to_i).ceil,
          total_count: total_count,
          per_page: per_page.to_i
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
          name: listing.user.name
        }
      }
    end
  end
end