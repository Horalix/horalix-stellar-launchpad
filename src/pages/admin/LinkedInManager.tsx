import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Pencil, Trash2, Loader2, ExternalLink, GripVertical } from "lucide-react";
import { format } from "date-fns";

/**
 * LinkedInManager - Admin page for managing LinkedIn post embeds
 * Supports CRUD operations on linkedin_posts table
 */

interface PostForm {
  id?: string;
  post_url: string;
  post_id: string;
  post_date: string;
  is_visible: boolean;
  display_order: number;
}

const defaultForm: PostForm = {
  post_url: "",
  post_id: "",
  post_date: "",
  is_visible: true,
  display_order: 0,
};

// Step 1: Extract post ID from LinkedIn URL
const extractPostId = (url: string): string | null => {
  // Pattern: linkedin.com/posts/...activity-{postId}-... or linkedin.com/feed/update/urn:li:activity:{postId}
  const activityMatch = url.match(/activity[:-](\d+)/);
  if (activityMatch) return activityMatch[1];
  
  // Pattern: linkedin.com/embed/feed/update/urn:li:share:{postId}
  const shareMatch = url.match(/share[:-](\d+)/);
  if (shareMatch) return shareMatch[1];

  // Pattern: linkedin.com/embed/feed/update/urn:li:ugcPost:{postId}
  const ugcMatch = url.match(/ugcPost[:-](\d+)/);
  if (ugcMatch) return ugcMatch[1];

  return null;
};

// Step 2: Validate LinkedIn URL
const isValidLinkedInUrl = (url: string): boolean => {
  return url.includes("linkedin.com") && extractPostId(url) !== null;
};

const LinkedInManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<PostForm>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Step 3: Fetch all posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-linkedin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("linkedin_posts")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Step 4: Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (post: PostForm) => {
      const payload = {
        post_url: post.post_url,
        post_id: post.post_id,
        post_date: post.post_date || null,
        is_visible: post.is_visible,
        display_order: post.display_order,
      };

      if (isEditing && post.id) {
        const { error } = await supabase
          .from("linkedin_posts")
          .update(payload)
          .eq("id", post.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("linkedin_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-linkedin-posts"] });
      setIsDialogOpen(false);
      setForm(defaultForm);
      setIsEditing(false);
      toast({ title: isEditing ? "Post updated" : "Post added" });
    },
    onError: (error: any) => {
      if (error.message.includes("duplicate")) {
        toast({ variant: "destructive", title: "Error", description: "This post has already been added." });
      } else {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    },
  });

  // Step 5: Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("linkedin_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-linkedin-posts"] });
      toast({ title: "Post removed" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Step 6: Handle URL change with validation
  const handleUrlChange = (url: string) => {
    setForm({ ...form, post_url: url });
    setUrlError(null);

    if (url && !isValidLinkedInUrl(url)) {
      setUrlError("Please enter a valid LinkedIn post URL");
      return;
    }

    const postId = extractPostId(url);
    if (postId) {
      // Check for duplicates
      const isDuplicate = posts?.some(
        (p) => p.post_id === postId && p.id !== form.id
      );
      if (isDuplicate) {
        setUrlError("This post has already been added");
        return;
      }
      setForm({ ...form, post_url: url, post_id: postId });
    }
  };

  // Step 7: Open edit dialog
  const handleEdit = (post: any) => {
    setForm({
      id: post.id,
      post_url: post.post_url,
      post_id: post.post_id,
      post_date: post.post_date ? post.post_date.split("T")[0] : "",
      is_visible: post.is_visible,
      display_order: post.display_order,
    });
    setIsEditing(true);
    setIsDialogOpen(false);
    setTimeout(() => setIsDialogOpen(true), 0);
  };

  // Step 8: Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from("linkedin_posts")
        .update({ display_order: newOrder })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-linkedin-posts"] });
    },
  });

  // Step 9: Handle order change
  const movePost = (index: number, direction: "up" | "down") => {
    if (!posts) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= posts.length) return;

    const post1 = posts[index];
    const post2 = posts[newIndex];

    updateOrderMutation.mutate({ id: post1.id, newOrder: post2.display_order });
    updateOrderMutation.mutate({ id: post2.id, newOrder: post1.display_order });
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-space">LinkedIn Posts</h1>
              <p className="text-muted-foreground mt-1">
                Manage LinkedIn post embeds for the homepage social section.
              </p>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setForm(defaultForm);
                  setIsEditing(false);
                  setUrlError(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Post" : "Add LinkedIn Post"}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (urlError) return;
                    saveMutation.mutate(form);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>LinkedIn Post URL</Label>
                    <Input
                      value={form.post_url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://www.linkedin.com/posts/..."
                      required
                    />
                    {urlError && (
                      <p className="text-xs text-destructive">{urlError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Paste the full URL of the LinkedIn post you want to embed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Post Date (optional)</Label>
                    <Input
                      type="date"
                      value={form.post_date}
                      onChange={(e) => setForm({ ...form, post_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={form.display_order}
                      onChange={(e) =>
                        setForm({ ...form, display_order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_visible}
                      onCheckedChange={(checked) => setForm({ ...form, is_visible: checked })}
                    />
                    <Label>Visible on Homepage</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveMutation.isPending || !!urlError || !form.post_id}
                    >
                      {saveMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {isEditing ? "Update" : "Add"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Posts table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Post ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : posts && posts.length > 0 ? (
                  posts.map((post, index) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <button
                              onClick={() => movePost(index, "up")}
                              disabled={index === 0}
                              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => movePost(index, "down")}
                              disabled={index === posts.length - 1}
                              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <a
                          href={post.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-accent transition-colors"
                        >
                          {post.post_id.slice(0, 10)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {post.post_date
                          ? format(new Date(post.post_date), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            post.is_visible
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {post.is_visible ? "Visible" : "Hidden"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(post)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Remove this post?")) {
                                deleteMutation.mutate(post.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No LinkedIn posts yet. Add your first post.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Help text */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">How to add LinkedIn posts:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Find a LinkedIn post you want to embed</li>
              <li>Click the "..." menu on the post and select "Copy link to post"</li>
              <li>Paste the URL above and the post will be automatically added</li>
              <li>Posts tagged with Horalix or reposted by Horalix can be added here</li>
            </ol>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default LinkedInManager;
