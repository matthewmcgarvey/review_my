class CreateUsers::V00000000000002 < Avram::Migrator::Migration::V1
  def migrate
    create table_for(User) do
      primary_key id : UUID
      add_timestamps
      add email : String, unique: true
      add encrypted_password : String
    end
  end

  def rollback
    drop table_for(User)
  end
end