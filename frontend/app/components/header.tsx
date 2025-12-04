import { HuddleUpLogo } from "./huddleup-logo";
import { useAppUser } from "~/providers/app-user-provider";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, User, CreditCard, Calendar } from "lucide-react";
import { removeAuthToken } from "~/utils/auth";

function getInitials(firstName: string | null, lastName: string | null): string {
  const firstInitial = firstName?.[0]?.toUpperCase() || "";
  const lastInitial = lastName?.[0]?.toUpperCase() || "";
  const initials = firstInitial + lastInitial;
  return initials || "U";
}

function getFullName(firstName: string | null, lastName: string | null): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "User";
}

export function Header() {
  const { username, firstName, lastName } = useAppUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    navigate("/turf/browse");
  };

  return (
    <div className="h-20 w-full border-b border-stone-300/80 bg-stone-100 py-4">
      <header className="mx-auto flex w-9/10 max-w-360 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/turf/browse" className="text-green-700 hover:opacity-80 transition-opacity">
            <HuddleUpLogo />
          </Link>
        </div>
        {username ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 rounded-full">
                <Avatar className="size-10 cursor-pointer border-2 border-stone-300 hover:border-stone-400 transition-colors">
                  <AvatarFallback className="bg-stone-400 text-stone-50 font-semibold">
                    {getInitials(firstName, lastName)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={20}
              className="w-56 border border-stone-300/80 rounded-md"
            >
              <DropdownMenuLabel className="px-3 py-2 border-b border-stone-300/80">
                <div className="flex flex-col">
                  <span className="font-semibold text-stone-900">
                    {getFullName(firstName, lastName)}
                  </span>
                  <span className="text-xs text-stone-500 font-normal">
                    @{username}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigate(`/user/${username}/profile`)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <User className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/user/${username}/cards`)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="size-4" />
                Payment Methods
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/user/${username}/booking`)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="size-4" />
                Previous Bookings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              className="w-20 border-green-700 bg-white text-green-700 hover:text-green-700"
              asChild
            >
              <Link to="/login">Log In</Link>
            </Button>
            <Button
              variant="default"
              className="w-20 bg-green-700 hover:bg-green-600"
              asChild
            >
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </header>
    </div>
  );
}
