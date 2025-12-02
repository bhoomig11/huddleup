import { HuddleUpLogo } from "./huddleup-logo";
import { useAppUser } from "~/providers/app-user-provider";
import { Button } from "./ui/button";
import { Link } from "react-router";
import { CircleUser } from "lucide-react";

export function Header() {
  const { username } = useAppUser();
  return (
    <div className="h-20 w-full border-b border-stone-300/80 bg-stone-100 py-4">
      <header className="mx-auto flex w-9/10 max-w-360 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="text-green-700">
            <HuddleUpLogo />
          </span>
        </div>
        {username ? (
          <div>
            <CircleUser className="size-10 text-stone-500" />
          </div>
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
