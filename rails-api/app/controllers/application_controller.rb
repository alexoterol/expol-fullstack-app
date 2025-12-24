# rails-api/app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  attr_reader :current_user
  
  private
  
  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last
    
    if token.blank?
      return render json: { error: 'Token no proporcionado' }, status: :unauthorized
    end
    
    begin
      decoded = JWT.decode(token, 'secret_key_here', true, algorithm: 'HS256')
      user_id = decoded[0]['user_id']
      @current_user = User.find(user_id)
    rescue JWT::DecodeError, JWT::ExpiredSignature
      render json: { error: 'Token inválido' }, status: :unauthorized
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Usuario no encontrado' }, status: :unauthorized
    end
  end
  
  def generate_token(user)
    payload = {
      user_id: user.id,
      exp: 24.hours.from_now.to_i
    }
    JWT.encode(payload, 'secret_key_here', 'HS256')
  end
end