import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import { Pencil, Loader2 } from "lucide-react";

/**
 * ContentManager - Admin page for managing site content
 * Editable text blocks for hero, taglines, etc.
 */

interface ContentForm {
  id: string;
  key: string;
  value: string;
  content_type: string;
  description: string;
}

const ContentManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<ContentForm | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all site content
  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("key", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (item: ContentForm) => {
      const { error } = await supabase
        .from("site_content")
        .update({ value: item.value })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      setIsDialogOpen(false);
      setForm(null);
      toast({ title: "Content updated" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Open edit dialog
  const handleEdit = (item: any) => {
    setForm({
      id: item.id,
      key: item.key,
      value: item.value,
      content_type: item.content_type,
      description: item.description || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold font-space">Site Content</h1>
            <p className="text-muted-foreground mt-1">
              Edit text content displayed on the website.
            </p>
          </div>

          {/* Content table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-16">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : content && content.length > 0 ? (
                  content.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.key}</TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">
                        {item.value}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                          {item.content_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No content items. Add content via database.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Edit dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setForm(null);
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Content</DialogTitle>
              </DialogHeader>
              {form && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateMutation.mutate(form);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Key</Label>
                    <Input value={form.key} disabled className="bg-secondary" />
                  </div>
                  {form.description && (
                    <p className="text-sm text-muted-foreground">{form.description}</p>
                  )}
                  <div className="space-y-2">
                    <Label>Value</Label>
                    {form.content_type === "text" ? (
                      <Input
                        value={form.value}
                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                        required
                      />
                    ) : (
                      <Textarea
                        value={form.value}
                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                        rows={6}
                        required
                      />
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default ContentManager;
