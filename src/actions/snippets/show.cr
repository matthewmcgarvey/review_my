class Snippets::Show < BrowserAction
  get "/snippets/:snippet_id" do
    snippet = SnippetQuery.new.find(snippet_id)

    # If you created the snippet, show the snippet
    # If you aren't allowed access, go away
    # If you already submitted a revision, show the revision
    # Otherwise, you're probably trying to create a revision
    if snippet.creator == current_user
      html Snippets::ShowPage, snippet: snippet
    elsif snippet.domain_restricted? && (snippet.creator.email_domain != current_user.email_domain)
      flash.failure = "That snippet is private."
      redirect Home::Index
    elsif (revision = snippet.revisions.find { |rev| rev.creator == current_user })
      redirect to: Snippets::Revisions::Show.with(snippet_id: snippet.slug, revision_id: revision.id)
    else
      redirect to: Snippets::Revisions::New.with(snippet_id: snippet.slug)
    end
  end
end
