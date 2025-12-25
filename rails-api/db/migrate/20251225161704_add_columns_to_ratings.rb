class AddColumnsToRatings < ActiveRecord::Migration[7.0]
  def change
    add_column :ratings, :user_id, :bigint, null: false unless column_exists?(:ratings, :user_id)
    add_column :ratings, :listing_id, :bigint, null: false unless column_exists?(:ratings, :listing_id)
    add_column :ratings, :rater_id, :bigint, null: false unless column_exists?(:ratings, :rater_id)
    add_column :ratings, :score, :integer, null: false unless column_exists?(:ratings, :score)
    add_column :ratings, :comment, :text unless column_exists?(:ratings, :comment)
    
    add_index :ratings, :user_id unless index_exists?(:ratings, :user_id)
    add_index :ratings, :listing_id unless index_exists?(:ratings, :listing_id)
    add_index :ratings, :rater_id unless index_exists?(:ratings, :rater_id)
    
    add_foreign_key :ratings, :users unless foreign_key_exists?(:ratings, :users)
    add_foreign_key :ratings, :listings unless foreign_key_exists?(:ratings, :listings)
    add_foreign_key :ratings, :users, column: :rater_id unless foreign_key_exists?(:ratings, column: :rater_id)
  end
end
