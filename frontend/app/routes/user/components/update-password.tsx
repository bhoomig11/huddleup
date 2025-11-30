import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { getInputClass } from "~/routes/user/utils";
import { updatePassword } from "~/api/user";
import { loginUser } from "~/api/auth";

interface UpdatePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}

export function UpdatePasswordDialog({
  open,
  onOpenChange,
  username,
}: UpdatePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if all fields are filled
  const isFormValid =
    currentPassword.trim() !== "" &&
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "";

  // Check if new password and confirm password match
  const passwordsMatch = newPassword === confirmPassword;

  // Clear error when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!isFormValid) {
      return;
    }

    // Check if passwords match
    if (!passwordsMatch) {
      setError("New password and confirm password do not match");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // First, verify the current password by attempting to login
      const verifyResponse = await loginUser({
        username,
        password: currentPassword,
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        setError(
          errorData.message || "Current password is incorrect"
        );
        return;
      }

      // Current password is correct, now update to new password
      const updateResponse = await updatePassword(username, newPassword);

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        setError(
          errorData.message || "Failed to update password"
        );
        return;
      }

      // Success - reset form and close dialog
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-stone-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-stone-600">
            Update Password
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-stone-600">
              Current Password
            </Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              className={getInputClass(currentPassword)}
              disabled={isSubmitting}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-stone-600">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              className={getInputClass(newPassword)}
              disabled={isSubmitting}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-stone-600">
              Confirm New Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              className={getInputClass(confirmPassword)}
              disabled={isSubmitting}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {!passwordsMatch && confirmPassword.trim() !== "" && (
              <p className="text-sm text-red-600">
                Passwords do not match
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="rounded bg-green-700 text-white hover:bg-green-600 active:bg-green-700"
            onClick={handleSave}
            disabled={!isFormValid || !passwordsMatch || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
