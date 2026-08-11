"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deletePatient } from "@/actions/patients";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type DeletePatientButtonProps = {
  patientId: string;
};

export function DeletePatientButton({
  patientId,
}: DeletePatientButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const result = await deletePatient(patientId);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success("Patient deleted successfully");

      router.push("/dashboard/patients");
      router.refresh();
    } catch (error) {
      console.error("DELETE_PATIENT_BUTTON_ERROR", error);
      toast.error("Failed to delete patient");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isDeleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Patient
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete this patient?
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. The patient record and all
            associated WhatsApp logs will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Patient"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}