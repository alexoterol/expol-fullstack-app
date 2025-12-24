# rails-api/db/migrate/20240101000001_create_users.rb
class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :password_digest, null: false
      t.boolean :verified, default: false

      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end