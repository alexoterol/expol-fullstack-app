# rails-api/app/controllers/health_controller.rb
class HealthController < ApplicationController
  def check
    render json: {
      status: 'ok',
      timestamp: Time.current,
      database: database_status
    }
  end
  
  private
  
  def database_status
    ActiveRecord::Base.connection.execute('SELECT 1')
    'connected'
  rescue
    'disconnected'
  end
end