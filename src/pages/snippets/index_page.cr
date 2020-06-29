class Snippets::IndexPage < MainLayout
  needs snippets : SnippetQuery

  def content
    h1 "Your Snippets", class: "text-center mt-4 mb-10 text-xl font-bold"

    div class: "grid md:grid-cols-2 lg:grid-cols-3 gap-4" do
      add_snippet_card

      snippets.each do |snippet|
        snippet_card(snippet)
      end
    end
  end

  private def snippet_card(snippet)
    div class: "h-32 border rounded bg-gray-200 flex flex-col justify-between" do
      div class: "relative mt-2" do
        div snippet.title, class: "text-center font-semibold"
        link to: Snippets::Show.with(snippet.slug) do
          i class: "fas fa-external-link-alt absolute top-0 right-0 mr-2 hover:text-indigo-400"
        end
      end

      copy_link_section(snippet)
    end
  end

  private def copy_link_section(snippet)
    url = Snippets::Show.with(snippet.slug).url

    div class: "text-center bg-gray-400 flex justify-between items-center", data_controller: "clipboard" do
      input class: "py-1 bg-transparent focus:outline-none w-full text-xs pl-4", value: url, readonly: true, data_target: "clipboard.source"
      button class: "text-xs h-full px-4 border-l bg-indigo-500 border-indigo-600 hover:bg-indigo-600 text-white font-semibold flex items-center space-x-2", data_action: "click->clipboard#copy" do
        i class: "far fa-copy"
        span "Copy"
      end
    end
  end

  private def add_snippet_card
    flex = "flex items-center justify-center"
    colors = "bg-indigo-500 hover:bg-indigo-600 text-white"

    link to: Snippets::New, class: "h-32 border rounded #{colors} #{flex} space-x-2" do
      i class: "fas fa-plus-circle"
      span "Create a new snippet", class: "font-extrabold"
    end
  end
end
