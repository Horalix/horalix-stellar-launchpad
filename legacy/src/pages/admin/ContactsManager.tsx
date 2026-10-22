import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, Loader2, Mail, Check, Archive, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * ContactsManager - Admin page for managing contact form submissions
 * View, respond, and track status of inquiries
 */

type ContactStatus = "new" | "in_progress" | "responded" | "archived";

const STATUS_OPTIONS: { value: ContactStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-blue-500/20 text-blue-500" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-500/20 text-yellow-500" },
  { value: "responded", label: "Responded", color: "bg-green-500/20 text-green-500" },
  { value: "archived", label: "Archived", color: "bg-gray-500/20 text-gray-500" },
];

const ContactsManager = () => {
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [contactToDelete, setContactToDelete] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all contacts
  const { data: contacts, isLoading } = useQuery({
    queryKey: ["admin-contacts", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Step 1: Send status notification to user via edge function
  const sendStatusNotification = async (
    submissionId: string,
    newStatus: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const { data: result, error: fnError } = await supabase.functions.invoke(
      "send-status-notification",
      { body: { submission_id: submissionId, new_status: newStatus } }
    );

    if (fnError) {
      console.error("Status notification function error:", fnError);
      return {
        ok: false,
        error: fnError.message,
      };
    }

    if (result?.error) {
      console.error("Status notification error:", result.error);
      return {
        ok: false,
        error: String(result.error),
      };
    }

    console.log("Status notification sent:", result);
    return { ok: true };
  };

  // Step 2: Update status mutation with notification
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: string;
      notes: string;
    }) => {
      // Update the database first
      const { error } = await supabase
        .from("contact_submissions")
        .update({
          status,
          notes,
          responded_at: status === "responded" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;

      // Send notification to user
      return await sendStatusNotification(id, status);
    },
    onSuccess: (notificationResult) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      setSelectedContact(null);

      if (notificationResult.ok) {
        toast({
          title: "Contact updated",
          description: "The user was notified of the status change.",
        });
      } else {
        toast({
          title: "Notification Failed",
          description: `Status was updated, but the email notification failed: ${notificationResult.error || "Unknown error"}`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      setContactToDelete(null);
      toast({ title: "Contact deleted" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Open view dialog
  const handleView = (contact: any) => {
    setSelectedContact(contact);
    setNotes(contact.notes || "");
  };

  // Get status color
  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find((s) => s.value === status)?.color || "bg-secondary";
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-space">Contact Submissions</h1>
              <p className="text-muted-foreground mt-1">
                View and manage contact form inquiries.
              </p>
            </div>

            {/* Status filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contacts table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16">View</TableHead>
                  <TableHead className="w-16">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : contacts && contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(contact.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-accent hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {contact.message}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(contact.status)}`}>
                          {STATUS_OPTIONS.find((s) => s.value === contact.status)?.label || contact.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleView(contact)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => setContactToDelete(contact)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No contact submissions yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* View/Edit dialog */}
          <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Contact Details</DialogTitle>
              </DialogHeader>
              {selectedContact && (
                <div className="space-y-4">
                  {/* Contact info */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedContact.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <a href={`mailto:${selectedContact.email}`} className="text-accent hover:underline">
                        {selectedContact.email}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{format(new Date(selectedContact.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <div className="bg-secondary p-4 rounded text-sm whitespace-pre-wrap">
                      {selectedContact.message}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Internal Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this inquiry..."
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateMutation.mutate({
                          id: selectedContact.id,
                          status: "in_progress",
                          notes,
                        })
                      }
                      disabled={updateMutation.isPending}
                    >
                      <Loader2 className={`w-4 h-4 mr-1 ${updateMutation.isPending ? "animate-spin" : "hidden"}`} />
                      In Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateMutation.mutate({
                          id: selectedContact.id,
                          status: "responded",
                          notes,
                        })
                      }
                      disabled={updateMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark Responded
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateMutation.mutate({
                          id: selectedContact.id,
                          status: "archived",
                          notes,
                        })
                      }
                      disabled={updateMutation.isPending}
                    >
                      <Archive className="w-4 h-4 mr-1" />
                      Archive
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete confirmation dialog */}
          <AlertDialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Contact Submission?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the submission from{" "}
                  <span className="font-medium text-foreground">{contactToDelete?.name}</span>?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => contactToDelete && deleteMutation.mutate(contactToDelete.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default ContactsManager;
