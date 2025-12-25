class AddColumnsToFavorites < ActiveRecord::Migration[7.0]
  def change
    add_column :favorites, :user_id, :bigint, null: false unless column_exists?(:favorites, :user_id)
    add_column :favorites, :listing_id, :bigint, null: false unless column_exists?(:favorites, :listing_id)
    
    add_index :favorites, :user_id unless index_exists?(:favorites, :user_id)
    add_index :favorites, :listing_id unless index_exists?(:favorites, :listing_id)
    add_index :favorites, [:user_id, :listing_id], unique: true unless index_exists?(:favorites, [:user_id, :listing_id])
    
    add_foreign_key :favorites, :users unless foreign_key_exists?(:favorites, :users)
    add_foreign_key :favorites, :listings unless foreign_key_exists?(:favorites, :listings)
  end
end
