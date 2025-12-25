class CreateRatings < ActiveRecord::Migration[7.0]
  def change
    create_table :ratings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :listing, null: false, foreign_key: true
      t.integer :rater_id, null: false
      t.integer :score, null: false
      t.text :comment

      t.timestamps
    end
    
    add_index :ratings, :rater_id
    add_foreign_key :ratings, :users, column: :rater_id
  end
end