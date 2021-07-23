class AddRevisionDeadlineToSnippets::V20210723183632 < Avram::Migrator::Migration::V1
  def migrate
    alter table_for(Snippet) do
      add revision_deadline : Time?
    end
  end

  def rollback
    alter table_for(Snippet) do
      remove :revision_deadline
    end
  end
end
