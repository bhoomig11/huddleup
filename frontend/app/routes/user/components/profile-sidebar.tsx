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
    <div className="basis-1/4 min-h-screen border-r bg-slate-50 p-6">
      {/* User Pic */}
      <div className="flex flex-col items-center mb-10 border-green-700">
        <img
          src={userImage}
          alt="profile"
          className="w-24 h-24 rounded-full shadow-sm justify-center"
        />
        <span className="mt-3 font-medium text-stone-500">@{username}</span>
      </div>

      <Separator className="mb-6" />

      {/* Navigation Buttons */}
      <div className="flex flex-col space-y-4">
        <Link
          to={`/user/${username}/profile`}
          className={cn(
            "text-left px-2 py-1 rounded text-stone-500 hover:bg-green-100",
            activeTab === "details" && "font-semibold bg-green-100"
          )}
        >
          Account Details
        </Link>

        <Link
          to={`/user/${username}/cards`}
          className={cn(
            "text-left px-2 py-1 rounded text-stone-500 hover:bg-green-100",
            activeTab === "payment" && "font-semibold bg-green-100"
          )}
        >
          Payment Methods
        </Link>

        <Link
          to={`/user/${username}/booking`}
          className={cn(
            "text-left px-2 py-1 rounded text-stone-500 hover:bg-green-100",
            activeTab === "bookings" && "font-semibold bg-green-100"
          )}
        >
          Previous Bookings
        </Link>
      </div>
    </div>
  );
}

