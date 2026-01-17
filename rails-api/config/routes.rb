Rails.application.routes.draw do
  # Rutas API sin namespace :api, solo v1
  namespace :v1, path: 'api/v1' do
    # Auth
    post 'auth/register', to: 'auth#register'
    post 'auth/login', to: 'auth#login'
    
    # Listings
    resources :listings do
      collection do
        get :my_listings
      end
      member do
        patch :toggle_status
      end
    end

    # Búsqueda Avanzada - Alex Otero
    get 'search', to: 'search#index'
    get 'search/suggestions', to: 'search#suggestions'
    get 'search/categories_stats', to: 'search#categories_stats'

    # Favoritos - Alex Otero
    resources :favorites, only: [:index, :create, :destroy] do
      collection do
        delete 'remove_by_listing/:listing_id', action: :remove_by_listing
        get 'check/:listing_id', action: :check
      end
    end

    # Usuarios y Perfiles - Alex Otero
    resources :users, only: [] do
      member do
        get 'profile', action: :show
        get 'listings'
        get 'ratings'
      end
    end

    get 'users/me', to: 'users#me'
    patch 'users/me', to: 'users#update_me'

    # Calificaciones
    resources :ratings, only: [:create, :update, :destroy]

    # Conversaciones y Mensajería - José Chong
    resources :conversations, only: [:index, :show, :create] do
      resources :messages, only: [:create] do
        collection do
          patch :mark_read
        end
      end
    end
  end
  
  get 'health', to: 'health#check'
end
