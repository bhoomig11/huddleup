import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { getInputClass } from "~/routes/user/utils";
import { fileComplaint, markComplaintAsResolved } from "~/api/user";

interface FileComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  bookingId: number;
  existingComplaint?: {
    subject: string;
    description: string;
    isResolved: boolean;
  } | null;
  onComplaintFiled?: () => void;
}

export function FileComplaintDialog({
  open,
  onOpenChange,
  username,
  bookingId,
  existingComplaint,
  onComplaintFiled,
}: FileComplaintDialogProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isResolved, setIsResolved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when existing complaint changes
  useEffect(() => {
    if (existingComplaint) {
      setSubject(existingComplaint.subject);
      setDescription(existingComplaint.description);
      setIsResolved(existingComplaint.isResolved);
    } else {
      setSubject("");
      setDescription("");
      setIsResolved(false);
    }
    // Clear error when dialog opens/closes
    setError(null);
  }, [existingComplaint, open]);

  const hasComplaint =
    existingComplaint !== null && existingComplaint !== undefined;

  // Check if form is valid (only when adding new complaint)
  const isFormValid =
    !hasComplaint && subject.trim() !== "" && description.trim() !== "";

  const handleCancel = () => {
    // Reset form if no existing complaint
    if (!hasComplaint) {
      setSubject("");
      setDescription("");
    }
    onOpenChange(false);
  };

  const handleAddComplaint = async () => {
    if (!subject.trim() || !description.trim()) {
      // TODO: backend error should be displayed to the user - handled by the procedure
      setError("Subject and description are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fileComplaint(
        username,
        bookingId,
        subject,
        description
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to file complaint: ${response.statusText}`
        );
      }

      // Success - close dialog and refresh bookings
      onOpenChange(false);
      if (onComplaintFiled) {
        onComplaintFiled();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to file complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkResolved = async () => {
    if (isResolved) {
      // Already resolved, don't do anything
      return;
    }

    setIsResolving(true);
    setError(null);

    try {
      const response = await markComplaintAsResolved(username, bookingId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(
          errorData.message ||
            `Failed to mark complaint as resolved: ${response.statusText}`
        );
        return;
      }

      // Success - update local state and refresh bookings
      setIsResolved(true);
      if (onComplaintFiled) {
        onComplaintFiled();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark complaint as resolved"
      );
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-stone-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-stone-600">
            {hasComplaint ? "Complaint Details" : "File a Complaint"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="complaint-subject" className="text-stone-600">
              Subject
            </Label>
            <Input
              id="complaint-subject"
              type="text"
              placeholder="Enter complaint subject"
              maxLength={64}
              value={subject}
              className={getInputClass(subject)}
              disabled={hasComplaint || isSubmitting}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="complaint-description" className="text-stone-600">
              Description
            </Label>
            <Textarea
              id="complaint-description"
              placeholder="Enter complaint description"
              maxLength={255}
              value={description}
              className={getInputClass(description)}
              disabled={hasComplaint || isSubmitting}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter
          className={hasComplaint ? "justify-between" : "justify-end"}
        >
          {hasComplaint && !isResolved && (
            <Button
              onClick={handleMarkResolved}
              disabled={isResolving}
              variant="outline"
              className="rounded text-sm bg-green-700 text-white"
            >
              {isResolving ? "Marking as resolved..." : "Mark as resolved"}
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="rounded text-stone-700"
              disabled={isResolving}
            >
              {hasComplaint ? "Close" : "Cancel"}
            </Button>
            {!hasComplaint && (
              <Button
                onClick={handleAddComplaint}
                className="rounded text-sm bg-green-700 text-white hover:bg-green-600 active:bg-green-700"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Add Complaint"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
