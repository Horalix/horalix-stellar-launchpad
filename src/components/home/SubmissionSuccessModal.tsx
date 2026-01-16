import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubmissionSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * SubmissionSuccessModal - Prominent confirmation after auto-submission
 * Displays center-screen to ensure users don't miss the confirmation
 */
export const SubmissionSuccessModal = ({
  open,
  onClose,
}: SubmissionSuccessModalProps) => {
  const navigate = useNavigate();

  // Step 1: Handle navigation to submissions page
  const handleViewSubmissions = () => {
    onClose();
    navigate("/profile/submissions");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-sm">
        <DialogHeader className="text-center sm:text-center">
          {/* Step 2: Success icon with animation */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          {/* Step 3: Clear success messaging */}
          <DialogTitle className="text-xl font-semibold">
            Message Transmitted!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Your inquiry has been submitted successfully. Our team will respond
            shortly.
          </DialogDescription>
        </DialogHeader>

        {/* Step 4: Action buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={handleViewSubmissions}
            className="order-2 sm:order-1"
          >
            View My Submissions
          </Button>
          <Button onClick={onClose} className="order-1 sm:order-2">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
