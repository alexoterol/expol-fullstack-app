# rails-api/config/routes.rb
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
  end
  
  get 'health', to: 'health#check'
end