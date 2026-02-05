import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

/**
 * NewsManager - Admin page for managing news articles
 * Supports CRUD operations on news_articles table
 */

interface ArticleForm {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  location: string;
  image_urls: string[];
  image_focus: Array<{ x: number; y: number }>;
  display_date: string;
  is_published: boolean;
}

const defaultForm: ArticleForm = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "NEWS",
  location: "",
  image_urls: [],
  image_focus: [],
  display_date: "",
  is_published: false,
};

const NewsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<ArticleForm>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all articles, sorted by display_date (admin-chosen date)
  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("display_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (article: ArticleForm) => {
      // Build payload (image_url column was dropped in migration)
      const payload = {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        category: article.category,
        location: article.location || null,
        image_urls: article.image_urls,
        image_focus: article.image_focus,
        display_date: article.display_date ? new Date(article.display_date).toISOString() : null,
        published_at: article.is_published ? new Date().toISOString() : null,
        is_published: article.is_published,
      };

      let articleId = article.id;

      if (isEditing && article.id) {
        const { error } = await supabase
          .from("news_articles")
          .update(payload)
          .eq("id", article.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("news_articles")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        articleId = data.id;
      }

      // If article is published, trigger newsletter send
      if (article.is_published && articleId) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;

          if (accessToken) {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-newsletter`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ article_id: articleId }),
              }
            );

            const result = await response.json();
            if (result.skipped) {
              console.log("Newsletter already sent for this article");
            } else if (result.success) {
              console.log(`Newsletter sent to ${result.recipients} subscribers`);
            }
          }
        } catch (newsletterError) {
          console.error("Failed to send newsletter:", newsletterError);
          // Don't fail the save if newsletter fails
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      setIsDialogOpen(false);
      setForm(defaultForm);
      setIsEditing(false);
      toast({ title: isEditing ? "Article updated" : "Article created" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast({ title: "Article deleted" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Parse image_urls from database
  const parseImageUrls = (article: any): string[] => {
    if (Array.isArray(article.image_urls) && article.image_urls.length > 0) {
      return article.image_urls;
    }
    return [];
  };

  // Parse image_focus from database and normalize to match image count
  const parseImageFocus = (article: any, imageCount: number): Array<{ x: number; y: number }> => {
    let focus: Array<{ x: number; y: number }> = [];
    if (Array.isArray(article.image_focus)) {
      focus = article.image_focus.map((f: any) => ({ x: f?.x ?? 50, y: f?.y ?? 50 }));
    }
    // Normalize array length to match image count
    while (focus.length < imageCount) {
      focus.push({ x: 50, y: 50 });
    }
    return focus.slice(0, imageCount);
  };

  // Open edit dialog
  const handleEdit = (article: any) => {
    const urls = parseImageUrls(article);
    const focus = parseImageFocus(article, urls.length);
    
    setForm({
      id: article.id,
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      content: article.content,
      category: article.category,
      location: article.location || "",
      image_urls: urls,
      image_focus: focus,
      display_date: article.display_date ? article.display_date.split("T")[0] : "",
      is_published: article.is_published,
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-space">News Articles</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage news articles for the website.
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setForm(defaultForm);
                setIsEditing(false);
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  // Reset form for new article before dialog opens
                  setForm(defaultForm);
                  setIsEditing(false);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="article-dialog-description">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Article" : "New Article"}</DialogTitle>
                  <DialogDescription id="article-dialog-description">
                    {isEditing ? "Update the article details below." : "Fill in the details to create a new article."}
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveMutation.mutate(form);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            title: e.target.value,
                            slug: isEditing ? form.slug : generateSlug(e.target.value),
                          });
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="NEWS, PRESS, UPDATE"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location (optional)</Label>
                      <Input
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Date (optional)</Label>
                      <Input
                        type="date"
                        value={form.display_date}
                        onChange={(e) => setForm({ ...form, display_date: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Override the date shown on the article (for older events)
                      </p>
                    </div>
                    <div className="col-span-2">
                      <MultiImageUpload
                        bucket="news-images"
                        value={form.image_urls}
                        onChange={(urls) => setForm(prev => ({ ...prev, image_urls: urls }))}
                        label="Article Images"
                        maxImages={10}
                        imageFocus={form.image_focus}
                        onFocusChange={(focus) => setForm(prev => ({ ...prev, image_focus: focus }))}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Summary</Label>
                      <Textarea
                        value={form.summary}
                        onChange={(e) => setForm({ ...form, summary: e.target.value })}
                        rows={2}
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        rows={10}
                        required
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Switch
                        checked={form.is_published}
                        onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
                      />
                      <Label>Published</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isEditing ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Articles table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : articles && articles.length > 0 ? (
                  articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                          {article.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            article.is_published
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {article.is_published ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {article.display_date 
                          ? format(new Date(article.display_date), "MMM d, yyyy")
                          : article.published_at 
                            ? format(new Date(article.published_at), "MMM d, yyyy")
                            : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(article)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Delete this article?")) {
                                deleteMutation.mutate(article.id);
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
                      No articles yet. Create your first article.
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

export default NewsManager;
