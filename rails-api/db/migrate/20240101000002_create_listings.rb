# rails-api/db/migrate/20240101000002_create_listings.rb
class CreateListings < ActiveRecord::Migration[7.1]
  def change
    create_table :listings do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description, null: false
      t.decimal :price, precision: 10, scale: 2, null: false
      t.string :category, null: false
      t.string :state, null: false
      t.string :status, default: 'active', null: false
      t.string :location, null: false
      t.integer :views_count, default: 0

      t.timestamps
    end

    add_index :listings, :user_id
    add_index :listings, :category
    add_index :listings, :status
  end
end