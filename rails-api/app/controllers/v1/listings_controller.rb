# rails-api/app/controllers/api/v1/listings_controller.rb
# RESPONSABLE: ALEXANDRE ICAZA
module V1
    class ListingsController < ApplicationController
      before_action :authenticate_user!, except: [:index, :show]
      before_action :set_listing, only: [:show, :update, :destroy, :toggle_status]
      before_action :authorize_owner!, only: [:update, :destroy, :toggle_status]
      
      # GET /api/v1/listings
      def index
        @listings = Listing.active.includes(:user)
        
        # Ordenamiento
        case params[:sort_by]
        when 'price_asc'
          @listings = @listings.order(price: :asc)
        when 'price_desc'
          @listings = @listings.order(price: :desc)
        else
          @listings = @listings.recent
        end
        
        # Paginación
        @listings = @listings.page(params[:page] || 1).per(params[:per_page] || 20)
        
        render json: {
          listings: @listings.map { |l| listing_json(l) },
          meta: pagination_meta(@listings)
        }
      end
      
      # GET /api/v1/listings/:id
      def show
        @listing.increment!(:views_count) unless current_user&.id == @listing.user_id
        
        render json: {
          listing: listing_detail_json(@listing),
          is_owner: current_user&.id == @listing.user_id
        }
      end
      
      # POST /api/v1/listings
      def create
        @listing = current_user.listings.build(listing_params)
        
        if @listing.save
          render json: {
            message: 'Publicación creada exitosamente',
            listing: listing_json(@listing)
          }, status: :created
        else
          render json: { errors: @listing.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      # PUT /api/v1/listings/:id
      def update
        if @listing.update(listing_params)
          render json: {
            message: 'Publicación actualizada exitosamente',
            listing: listing_json(@listing)
          }
        else
          render json: { errors: @listing.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      # DELETE /api/v1/listings/:id
      def destroy
        if @listing.destroy
          render json: { message: 'Publicación eliminada exitosamente' }
        else
          render json: { errors: ['No se pudo eliminar'] }, status: :unprocessable_entity
        end
      end
      
      # GET /api/v1/listings/my_listings
      def my_listings
        @listings = current_user.listings.order(created_at: :desc)
                                .page(params[:page] || 1)
                                .per(params[:per_page] || 20)
        
        render json: {
          listings: @listings.map { |l| listing_json(l, include_stats: true) },
          meta: pagination_meta(@listings)
        }
      end
      
      # PATCH /api/v1/listings/:id/toggle_status
      def toggle_status
        new_status = @listing.status == 'active' ? 'paused' : 'active'
        
        if @listing.update(status: new_status)
          render json: {
            message: "Publicación #{new_status == 'active' ? 'activada' : 'pausada'}",
            listing: listing_json(@listing)
          }
        else
          render json: { errors: @listing.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      private
      
      def set_listing
        @listing = Listing.includes(:user).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Publicación no encontrada' }, status: :not_found
      end
      
      def authorize_owner!
        unless @listing.user_id == current_user.id
          render json: { error: 'No autorizado' }, status: :forbidden
        end
      end
      
      def listing_params
        params.require(:listing).permit(
          :title, :description, :price, :category, 
          :state, :location, :status
        )
      end
      
      def listing_json(listing, include_stats: false)
        json = {
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
            email: listing.user.email
          }
        }
        
        json[:views_count] = listing.views_count || 0 if include_stats
        json
      end
      
      def listing_detail_json(listing)
        listing_json(listing, include_stats: true)
      end
      
      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count,
          per_page: collection.limit_value
        }
      end
    end
  end
