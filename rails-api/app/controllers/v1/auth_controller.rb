# rails-api/app/controllers/v1/auth_controller.rb
module V1
  class AuthController < ApplicationController
    
    # POST /api/v1/auth/register
    def register
      @user = User.new(register_params)
      @user.verified = true # Simplificado para testing
      
      if @user.save
        token = generate_token(@user)
        render json: {
          message: 'Usuario registrado exitosamente',
          user: user_json(@user),
          token: token
        }, status: :created
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    # POST /api/v1/auth/login
    def login
      @user = User.find_by(email: params[:email])
      
      if @user&.authenticate(params[:password])
        token = generate_token(@user)
        render json: {
          message: 'Inicio de sesión exitoso',
          user: user_json(@user),
          token: token
        }, status: :ok
      else
        render json: { error: 'Credenciales inválidas' }, status: :unauthorized
      end
    end
    
    private
    
    def register_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end
    
    def user_json(user)
      {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    end
  end
end