# Migración para Conversaciones - José Chong
class CreateConversations < ActiveRecord::Migration[7.1]
  def change
    create_table :conversations do |t|
      t.references :buyer, null: false, foreign_key: { to_table: :users }
      t.references :seller, null: false, foreign_key: { to_table: :users }
      t.references :listing, null: false, foreign_key: true

      t.timestamps
    end

    add_index :conversations, [:buyer_id, :seller_id, :listing_id], unique: true, name: 'index_conversations_uniqueness'
  end
end
