import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

interface ContributorForm {
  id?: string;
  slug: string;
  name: string;
  role: string;
  credentials: string;
  specialty: string;
  bio_short: string;
  bio_long: string;
  photo_url: string;
  linkedin_url: string;
  same_as: string;
  contributor_type: string;
  display_order: number;
  is_public: boolean;
}

const defaultForm: ContributorForm = {
  slug: "",
  name: "",
  role: "",
  credentials: "",
  specialty: "",
  bio_short: "",
  bio_long: "",
  photo_url: "",
  linkedin_url: "",
  same_as: "",
  contributor_type: "author",
  display_order: 0,
  is_public: true,
};

type ContributorRow = Tables<"contributors">;

const ContributorsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<ContributorForm>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contributors, isLoading } = useQuery({
    queryKey: ["admin-contributors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contributors").select("*").order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (contributor: ContributorForm) => {
      const payload = {
        slug: contributor.slug,
        name: contributor.name,
        role: contributor.role,
        credentials: contributor.credentials || null,
        specialty: contributor.specialty || null,
        bio_short: contributor.bio_short,
        bio_long: contributor.bio_long || null,
        photo_url: contributor.photo_url || null,
        linkedin_url: contributor.linkedin_url || null,
        same_as: contributor.same_as
          ? contributor.same_as.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        contributor_type: contributor.contributor_type,
        display_order: contributor.display_order,
        is_public: contributor.is_public,
      };

      if (isEditing && contributor.id) {
        const { error } = await supabase.from("contributors").update(payload).eq("id", contributor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("contributors").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contributors"] });
      setIsDialogOpen(false);
      setForm(defaultForm);
      setIsEditing(false);
      toast({ title: isEditing ? "Contributor updated" : "Contributor created" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contributors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contributors"] });
      toast({ title: "Contributor deleted" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleEdit = (contributor: ContributorRow) => {
    setForm({
      id: contributor.id,
      slug: contributor.slug,
      name: contributor.name,
      role: contributor.role,
      credentials: contributor.credentials || "",
      specialty: contributor.specialty || "",
      bio_short: contributor.bio_short,
      bio_long: contributor.bio_long || "",
      photo_url: contributor.photo_url || "",
      linkedin_url: contributor.linkedin_url || "",
      same_as: Array.isArray(contributor.same_as) ? contributor.same_as.join(", ") : "",
      contributor_type: contributor.contributor_type,
      display_order: contributor.display_order,
      is_public: contributor.is_public,
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-space">Contributors</h1>
              <p className="mt-1 text-muted-foreground">Manage public author and reviewer profiles.</p>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setForm(defaultForm);
                  setIsEditing(false);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Contributor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Contributor" : "New Contributor"}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveMutation.mutate(form);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={form.name}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            name: event.target.value,
                            slug: isEditing ? form.slug : generateSlug(event.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Contributor Type</Label>
                      <Input
                        value={form.contributor_type}
                        onChange={(event) => setForm({ ...form, contributor_type: event.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Credentials</Label>
                      <Input value={form.credentials} onChange={(event) => setForm({ ...form, credentials: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialty</Label>
                      <Input value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Short Bio</Label>
                      <Textarea value={form.bio_short} onChange={(event) => setForm({ ...form, bio_short: event.target.value })} rows={3} required />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Long Bio</Label>
                      <Textarea value={form.bio_long} onChange={(event) => setForm({ ...form, bio_long: event.target.value })} rows={6} />
                    </div>
                    <div className="space-y-2">
                      <Label>Photo URL</Label>
                      <Input value={form.photo_url} onChange={(event) => setForm({ ...form, photo_url: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn URL</Label>
                      <Input value={form.linkedin_url} onChange={(event) => setForm({ ...form, linkedin_url: event.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>sameAs URLs</Label>
                      <Input
                        value={form.same_as}
                        onChange={(event) => setForm({ ...form, same_as: event.target.value })}
                        placeholder="https://example.com, https://example.org"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={form.display_order}
                        onChange={(event) => setForm({ ...form, display_order: parseInt(event.target.value, 10) || 0 })}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch checked={form.is_public} onCheckedChange={(checked) => setForm({ ...form, is_public: checked })} />
                      <Label>Public</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isEditing ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : contributors && contributors.length > 0 ? (
                  contributors.map((contributor) => (
                    <TableRow key={contributor.id}>
                      <TableCell className="font-medium">{contributor.name}</TableCell>
                      <TableCell className="text-muted-foreground">{contributor.role}</TableCell>
                      <TableCell className="text-muted-foreground">{contributor.contributor_type}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            contributor.is_public ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {contributor.is_public ? "Public" : "Hidden"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(contributor)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Delete this contributor?")) {
                                deleteMutation.mutate(contributor.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No contributors yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default ContributorsManager;
