class Shared::Navbar < BaseComponent
  needs current_user : User

  def render
    nav class: "w-full flex items-center justify-between bg-gray-200 border-b px-6 py-4" do
      link "ReviewMy", to: Home::Index, class: "font-extrabold text-lg #{link_color}"

      div class: "space-x-4" do
        link current_user.email, to: Me::Show, class: "bg-teal-400 hover:bg-teal-500 hover:text-teal-100 px-3 py-1 rounded-full"
        link "Sign Out", to: SignIns::Delete, class: "font-semibold #{link_color}", flow_id: "sign-out-button"
      end
    end
  end

  private def link_color
    "hover:text-teal-800"
  end
end