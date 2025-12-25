class AddFavoritesCountToListings < ActiveRecord::Migration[7.0]
  def change
    add_column :listings, :favorites_count, :integer, default: 0, null: false
  end
end