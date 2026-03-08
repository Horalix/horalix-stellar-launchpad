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

interface ResourceForm {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  content_type: string;
  topic_cluster: string;
  primary_keyword: string;
  secondary_keywords: string;
  seo_title: string;
  seo_description: string;
  canonical_path: string;
  region_scope: string;
  cta_variant: string;
  author_id: string;
  reviewer_id: string;
  is_published: boolean;
}

const defaultForm: ResourceForm = {
  slug: "",
  title: "",
  summary: "",
  content: "",
  content_type: "guide",
  topic_cluster: "",
  primary_keyword: "",
  secondary_keywords: "",
  seo_title: "",
  seo_description: "",
  canonical_path: "",
  region_scope: "global",
  cta_variant: "demo",
  author_id: "",
  reviewer_id: "",
  is_published: false,
};

type ResourceRow = Tables<"resources">;

const ResourcesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<ResourceForm>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: resources, isLoading } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: contributors } = useQuery({
    queryKey: ["admin-resource-contributors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contributors").select("id, name").order("display_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (resource: ResourceForm) => {
      const payload = {
        slug: resource.slug,
        title: resource.title,
        summary: resource.summary,
        content: resource.content,
        content_type: resource.content_type,
        topic_cluster: resource.topic_cluster || null,
        primary_keyword: resource.primary_keyword || null,
        secondary_keywords: resource.secondary_keywords
          ? resource.secondary_keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean)
          : [],
        seo_title: resource.seo_title || null,
        seo_description: resource.seo_description || null,
        canonical_path: resource.canonical_path || null,
        region_scope: resource.region_scope,
        cta_variant: resource.cta_variant || null,
        author_id: resource.author_id || null,
        reviewer_id: resource.reviewer_id || null,
        is_published: resource.is_published,
        published_at: resource.is_published ? new Date().toISOString() : null,
      };

      if (isEditing && resource.id) {
        const { error } = await supabase.from("resources").update(payload).eq("id", resource.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("resources").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      setIsDialogOpen(false);
      setForm(defaultForm);
      setIsEditing(false);
      toast({ title: isEditing ? "Resource updated" : "Resource created" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      toast({ title: "Resource deleted" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleEdit = (resource: ResourceRow) => {
    setForm({
      id: resource.id,
      slug: resource.slug,
      title: resource.title,
      summary: resource.summary,
      content: resource.content,
      content_type: resource.content_type,
      topic_cluster: resource.topic_cluster || "",
      primary_keyword: resource.primary_keyword || "",
      secondary_keywords: Array.isArray(resource.secondary_keywords) ? resource.secondary_keywords.join(", ") : "",
      seo_title: resource.seo_title || "",
      seo_description: resource.seo_description || "",
      canonical_path: resource.canonical_path || "",
      region_scope: resource.region_scope || "global",
      cta_variant: resource.cta_variant || "demo",
      author_id: resource.author_id || "",
      reviewer_id: resource.reviewer_id || "",
      is_published: resource.is_published,
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
              <h1 className="text-3xl font-bold font-space">Resources</h1>
              <p className="mt-1 text-muted-foreground">Manage evergreen authority content.</p>
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
                  New Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Resource" : "New Resource"}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveMutation.mutate(form);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={form.title}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            title: event.target.value,
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
                      <Label>Content Type</Label>
                      <Input value={form.content_type} onChange={(event) => setForm({ ...form, content_type: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Topic Cluster</Label>
                      <Input value={form.topic_cluster} onChange={(event) => setForm({ ...form, topic_cluster: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Keyword</Label>
                      <Input value={form.primary_keyword} onChange={(event) => setForm({ ...form, primary_keyword: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Region Scope</Label>
                      <Input value={form.region_scope} onChange={(event) => setForm({ ...form, region_scope: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Variant</Label>
                      <Input value={form.cta_variant} onChange={(event) => setForm({ ...form, cta_variant: event.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Summary</Label>
                      <Textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} rows={3} required />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Content</Label>
                      <Textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows={12} required />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Secondary Keywords</Label>
                      <Input
                        value={form.secondary_keywords}
                        onChange={(event) => setForm({ ...form, secondary_keywords: event.target.value })}
                        placeholder="keyword one, keyword two"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>SEO Title</Label>
                      <Input value={form.seo_title} onChange={(event) => setForm({ ...form, seo_title: event.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>SEO Description</Label>
                      <Textarea value={form.seo_description} onChange={(event) => setForm({ ...form, seo_description: event.target.value })} rows={3} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Canonical Path</Label>
                      <Input value={form.canonical_path} onChange={(event) => setForm({ ...form, canonical_path: event.target.value })} placeholder="/resources/example-slug" />
                    </div>
                    <div className="space-y-2">
                      <Label>Author</Label>
                      <select
                        value={form.author_id}
                        onChange={(event) => setForm({ ...form, author_id: event.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">None</option>
                        {contributors?.map((contributor) => (
                          <option key={contributor.id} value={contributor.id}>
                            {contributor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Reviewer</Label>
                      <select
                        value={form.reviewer_id}
                        onChange={(event) => setForm({ ...form, reviewer_id: event.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">None</option>
                        {contributors?.map((contributor) => (
                          <option key={contributor.id} value={contributor.id}>
                            {contributor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Switch checked={form.is_published} onCheckedChange={(checked) => setForm({ ...form, is_published: checked })} />
                      <Label>Published</Label>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
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
                ) : resources && resources.length > 0 ? (
                  resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.title}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">/resources/{resource.slug}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            resource.is_published ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {resource.is_published ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(resource.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(resource)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Delete this resource?")) {
                                deleteMutation.mutate(resource.id);
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
                      No resources yet.
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

export default ResourcesManager;
