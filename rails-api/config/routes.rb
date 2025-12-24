# rails-api/config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Autenticación
      post 'auth/register', to: 'auth#register'
      post 'auth/login', to: 'auth#login'
      
      # Publicaciones - ALEXANDRE ICAZA
      resources :listings do
        collection do
          get 'my_listings'
        end
        member do
          patch 'toggle_status'
        end
      end
    end
  end
  
  # Health check
  get 'health', to: 'health#check'
end