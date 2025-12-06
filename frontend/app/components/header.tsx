import { useState, useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { LogOut, User, CreditCard, Calendar, Bell } from "lucide-react";
import { removeAuthToken } from "~/utils/auth";
import { getAllAnnouncements, getAnnouncement, markAnnouncementAsRead } from "~/api/user";
import type { AnnouncementSummary, AnnouncementDetail } from "~/types/announcement";
import { AnnouncementDetailDialog } from "./announcement-detail";

function getInitials(
  firstName: string | null,
  lastName: string | null
): string {
  const firstInitial = firstName?.[0]?.toUpperCase() || "";
  const lastInitial = lastName?.[0]?.toUpperCase() || "";
  const initials = firstInitial + lastInitial;
  return initials || "U";
}

function getFullName(
  firstName: string | null,
  lastName: string | null
): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "User";
}

export function Header() {
  const { username, firstName, lastName } = useAppUser();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([]);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleLogout = () => {
    removeAuthToken();
    navigate("/");
  };

  useEffect(() => {
    if (isAnnouncementsOpen && username) {
      setIsLoadingAnnouncements(true);
      setAnnouncementsError(null);
      getAllAnnouncements(username)
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message ||
                `Failed to fetch announcements: ${response.statusText}`
            );
          }
          const data = await response.json();
          setAnnouncements(data);
        })
        .catch((err) => {
          setAnnouncementsError(
            err instanceof Error ? err.message : "Failed to fetch announcements"
          );
        })
        .finally(() => {
          setIsLoadingAnnouncements(false);
        });
    }
  }, [isAnnouncementsOpen, username]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewAnnouncement = async (announcementId: number) => {
    if (!username) return;

    setIsLoadingDetail(true);
    try {
      // Check if announcement is unread and mark it as read
      const announcement = announcements.find(
        (a) => a.announcementId === announcementId
      );
      if (announcement && !announcement.readAt) {
        try {
          const markReadResponse = await markAnnouncementAsRead(
            username,
            announcementId
          );
          if (markReadResponse.ok) {
            // Update local state to mark as read
            setAnnouncements((prev) =>
              prev.map((a) =>
                a.announcementId === announcementId
                  ? { ...a, readAt: new Date().toISOString() }
                  : a
              )
            );
          }
        } catch (err) {
          console.error("Error marking announcement as read:", err);
          // Continue to show announcement even if marking as read fails
        }
      }

      // Fetch and show announcement details
      const response = await getAnnouncement(username, announcementId);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch announcement: ${response.statusText}`
        );
      }
      const announcementDetail = (await response.json()) as AnnouncementDetail;
      setSelectedAnnouncement(announcementDetail);
      setIsDetailDialogOpen(true);
    } catch (err) {
      console.error("Error fetching announcement details:", err);
      // Could show an error toast here if needed
    } finally {
      setIsLoadingDetail(false);
    }
  };


  return (
    <div className="h-20 w-full border-b border-stone-300/80 bg-stone-100 py-4">
      <header className="mx-auto flex w-9/10 max-w-360 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-green-700 transition-opacity hover:opacity-80"
          >
            <HuddleUpLogo />
          </Link>
        </div>
        {username ? (
          <div className="flex items-center gap-3">
            <Popover open={isAnnouncementsOpen} onOpenChange={setIsAnnouncementsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-stone-200 relative"
                >
                  <Bell className="size-5 text-stone-600" />
                  {announcements.filter((a) => !a.readAt).length > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 bg-stone-50 border-stone-300/80"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-300/80 pb-2">
                    <h3 className="font-semibold text-stone-900">Announcements</h3>
                    {announcements.filter((a) => !a.readAt).length > 0 && (
                      <span className="text-xs text-stone-500">
                        {announcements.filter((a) => !a.readAt).length} unread
                      </span>
                    )}
                  </div>
                  {isLoadingAnnouncements ? (
                    <div className="py-4 text-center text-sm text-stone-500">
                      Loading announcements...
                    </div>
                  ) : announcementsError ? (
                    <div className="py-4 text-center text-sm text-red-600">
                      {announcementsError}
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="py-4 text-center text-sm text-stone-500">
                      No announcements
                    </div>
                  ) : (
                    <div className="max-h-[180px] overflow-y-auto space-y-2">
                      {announcements.map((announcement) => (
                        <div
                          key={announcement.announcementId}
                          className={`p-3 rounded-md border ${
                            announcement.readAt
                              ? "bg-stone-100 border-stone-200"
                              : "bg-white border-stone-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-sm font-medium ${
                                  announcement.readAt
                                    ? "text-stone-600"
                                    : "text-stone-900 font-semibold"
                                }`}
                              >
                                {announcement.announcementTitle}
                              </h4>
                              <p className="text-xs text-stone-500 mt-1">
                                {formatDate(announcement.sentAt)}
                              </p>
                            </div>
                            {!announcement.readAt && (
                              <span className="h-2 w-2 bg-green-700 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <div className="mt-2 flex justify-end">
                            <Button
                              size="sm"
                              // variant="outline"
                              className="rounded bg-green-700 text-xs text-white hover:bg-green-600 active:bg-green-700"
                              onClick={() => handleViewAnnouncement(announcement.announcementId)}
                              disabled={isLoadingDetail}
                            >
                              {isLoadingDetail ? "Loading..." : "View"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 focus:outline-none">
                  <Avatar className="size-10 cursor-pointer border-2 border-stone-300 transition-colors hover:border-stone-400">
                    <AvatarFallback className="bg-stone-400 font-semibold text-stone-50">
                      {getInitials(firstName, lastName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={20}
              className="w-56 rounded-md border border-stone-300/80"
            >
              <DropdownMenuLabel className="border-b border-stone-300/80 px-3 py-2">
                <div className="flex flex-col">
                  <span className="font-semibold text-stone-900">
                    {getFullName(firstName, lastName)}
                  </span>
                  <span className="text-xs font-normal text-stone-500">
                    @{username}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigate(`/user/${username}/profile`)}
                className="flex cursor-pointer items-center gap-2"
              >
                <User className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/user/${username}/cards`)}
                className="flex cursor-pointer items-center gap-2"
              >
                <CreditCard className="size-4" />
                Payment Methods
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/user/${username}/booking`)}
                className="flex cursor-pointer items-center gap-2"
              >
                <Calendar className="size-4" />
                Previous Bookings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
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
      <AnnouncementDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        announcement={selectedAnnouncement}
      />
    </div>
  );
}
