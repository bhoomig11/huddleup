import { useSubmit } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

interface DeleteReviewDialogProps {
  children: React.ReactNode;
}

export function DeleteReviewDialog({ children }: DeleteReviewDialogProps) {
  const submit = useSubmit();

  const handleDelete = () => {
    const formData = new FormData();
    submit(formData, {
      method: "DELETE",
      replace: true,
      preventScrollReset: true,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-stone-700">
            Delete Review
          </AlertDialogTitle>
          <AlertDialogDescription className="text-stone-600">
            Are you sure you want to delete your review? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-stone-300 text-stone-700 hover:bg-stone-50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
