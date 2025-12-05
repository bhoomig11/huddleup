import { Link, useParams, useLocation } from "react-router";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import userImage from "~/assets/user-image.png";

export function ProfileSidebar() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();

  // Determine active tab based on current route
  const getActiveTab = (): "details" | "payment" | "bookings" => {
    if (location.pathname.includes("/cards")) return "payment";
    if (location.pathname.includes("/booking")) return "bookings";
    return "details";
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen basis-1/4 border-r bg-stone-100 p-6">
      {/* User Pic */}
      <div className="mb-10 flex flex-col items-center border-green-700">
        <img
          src={userImage}
          alt="profile"
          className="h-24 w-24 justify-center rounded-full shadow-sm"
        />
        <span className="mt-3 font-medium text-stone-500">@{username}</span>
      </div>

      <Separator className="mb-6" />

      {/* Navigation Buttons */}
      <div className="flex flex-col space-y-4">
        <Link
          to={`/user/${username}/profile`}
          className={cn(
            "rounded px-2 py-1 text-left text-stone-500 hover:bg-green-100",
            activeTab === "details" && "bg-green-100 font-semibold"
          )}
        >
          Account Details
        </Link>

        <Link
          to={`/user/${username}/cards`}
          className={cn(
            "rounded px-2 py-1 text-left text-stone-500 hover:bg-green-100",
            activeTab === "payment" && "bg-green-100 font-semibold"
          )}
        >
          Payment Methods
        </Link>

        <Link
          to={`/user/${username}/booking`}
          className={cn(
            "rounded px-2 py-1 text-left text-stone-500 hover:bg-green-100",
            activeTab === "bookings" && "bg-green-100 font-semibold"
          )}
        >
          Previous Bookings
        </Link>
      </div>
    </div>
  );
}
