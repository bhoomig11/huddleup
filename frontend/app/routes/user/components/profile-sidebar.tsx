import { Link, useParams, useLocation } from "react-router";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { useAppUser } from "~/providers/app-user-provider";

function getInitials(
  firstName: string | null,
  lastName: string | null
): string {
  const firstInitial = firstName?.[0]?.toUpperCase() || "";
  const lastInitial = lastName?.[0]?.toUpperCase() || "";
  const initials = firstInitial + lastInitial;
  return initials || "U";
}

export function ProfileSidebar() {
  const { username } = useParams<{ username: string }>();
  const { firstName, lastName } = useAppUser();
  const location = useLocation();

  // Determine active tab based on current route
  const getActiveTab = (): "details" | "payment" | "previous" | "upcoming" => {
    if (location.pathname.includes("/cards")) return "payment";
    if (location.pathname.includes("/booking/upcoming")) return "upcoming";
    if (location.pathname.includes("/booking")) return "previous";
    return "details";
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen basis-1/4 border-r bg-stone-100 p-6">
      {/* User Pic */}
      <div className="mb-10 flex flex-col items-center border-green-700">
        <Avatar className="size-24 border-2 border-stone-300 shadow-sm">
          <AvatarFallback className="bg-stone-400 font-semibold text-stone-50 text-2xl">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        <span className="mt-3 font-medium text-stone-500">@{username}</span>
      </div>

      <Separator className="mb-6" />

      {/* Navigation Buttons */}
      <div className="flex flex-col space-y-4">
        <Link
          to={`/user/${username}/profile`}
          className={cn(
            "rounded px-2 py-1 text-left font-semibold text-green-700 hover:bg-stone-300/30",
            activeTab === "details" && "bg-stone-300/60 font-semibold"
          )}
        >
          Account Details
        </Link>

        <Link
          to={`/user/${username}/cards`}
          className={cn(
            "rounded px-2 py-1 text-left font-semibold text-green-700 hover:bg-stone-300/30",
            activeTab === "payment" && "bg-stone-300/60 font-semibold"
          )}
        >
          Payment Methods
        </Link>

        <Link
          to={`/user/${username}/booking/upcoming`}
          className={cn(
            "rounded px-2 py-1 text-left font-semibold text-green-700 hover:bg-stone-300/30",
            activeTab === "upcoming" && "bg-stone-300/60 font-semibold"
          )}
        >
          Upcoming Bookings
        </Link>

        <Link
          to={`/user/${username}/booking`}
          className={cn(
            "rounded px-2 py-1 text-left font-semibold text-green-700 hover:bg-stone-300/30",
            activeTab === "previous" && "bg-stone-300/60 font-semibold"
          )}
        >
          Previous Bookings
        </Link>
      </div>
    </div>
  );
}
