import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { AnnouncementDetail } from "~/types/announcement";

interface AnnouncementDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: AnnouncementDetail | null;
}

export function AnnouncementDetailDialog({
  open,
  onOpenChange,
  announcement,
}: AnnouncementDetailDialogProps) {
  if (!announcement) {
    return null;
  }

  const formattedDate = announcement.sentAt
    ? format(new Date(announcement.sentAt), "MMM dd, yyyy 'at' h:mm a")
    : "Date not available";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-stone-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-stone-600">
            {announcement.announcementTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-stone-600 whitespace-pre-wrap">
            {announcement.announcementMessage}
          </p>
        </div>
        <DialogFooter className="flex-row justify-between items-center">
          <p className="text-sm text-stone-500">{formattedDate}</p>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded text-stone-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

