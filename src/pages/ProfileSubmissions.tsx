import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, Loader2, MessageSquare, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
import { format } from "date-fns";

/**
 * ProfileSubmissions - User's contact form submissions
 * Allows users to view and delete their submissions
 */

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
  responded_at: string | null;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    new: {
      label: "Pending",
      icon: <Clock className="w-3 h-3" />,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    in_progress: {
      label: "In Progress",
      icon: <AlertCircle className="w-3 h-3" />,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    responded: {
      label: "Responded",
      icon: <CheckCircle className="w-3 h-3" />,
      className: "bg-green-100 text-green-800 border-green-200",
    },
  };

  const config = statusConfig[status] || statusConfig.new;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default function ProfileSubmissions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch user's submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("contact_submissions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setSubmissions(data || []);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast({
          title: "Error Loading Submissions",
          description: "Failed to load your submissions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [user, toast]);

  // Handle delete submission
  const handleDelete = async (id: string) => {
    setDeletingId(id);

    try {
        const userId = user?.id;
        if (!userId) return;
        
        const { error } = await supabase
          .from("contact_submissions")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (error) throw error;

      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: "Submission Deleted",
        description: "Your submission has been removed.",
      });
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold font-space text-foreground">
              My Submissions
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage your contact form submissions
            </p>
          </div>

          {/* Submissions list */}
          {submissions.length === 0 ? (
            <div className="bg-card border border-border shadow-lg p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">
                No Submissions Yet
              </h2>
              <p className="text-muted-foreground mb-6">
                You haven't submitted any contact forms yet.
              </p>
              <Link to="/#contact">
                <Button className="text-xs font-bold uppercase tracking-widest">
                  Contact Us
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-card border border-border shadow-lg p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={submission.status} />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(submission.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      {submission.responded_at && (
                        <p className="text-xs text-green-600">
                          Responded on {format(new Date(submission.responded_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>

                    {/* Delete button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={deletingId === submission.id}
                        >
                          {deletingId === submission.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            your contact submission.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(submission.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Message content */}
                  <div className="space-y-2">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {submission.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
