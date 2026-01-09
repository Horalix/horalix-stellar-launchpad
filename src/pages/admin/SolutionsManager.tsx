import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

/**
 * SolutionsManager - Admin page for managing solutions/products
 * Supports CRUD operations on solutions table
 */

interface SolutionForm {
  id?: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  icon_name: string;
  badge_text: string;
  specs: string; // JSON string
  features: string; // JSON string array
  display_order: number;
  is_active: boolean;
}

const defaultForm: SolutionForm = {
  name: "",
  slug: "",
  short_description: "",
  full_description: "",
  icon_name: "Activity",
  badge_text: "",
  specs: "{}",
  features: "[]",
  display_order: 0,
  is_active: true,
};

const SolutionsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<SolutionForm>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all solutions
  const { data: solutions, isLoading } = useQuery({
    queryKey: ["admin-solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (solution: SolutionForm) => {
      // Parse JSON fields
      let specs = {};
      let features: string[] = [];
      try {
        specs = JSON.parse(solution.specs);
        features = JSON.parse(solution.features);
      } catch {
        throw new Error("Invalid JSON in specs or features");
      }

      const payload = {
        name: solution.name,
        slug: solution.slug,
        short_description: solution.short_description,
        full_description: solution.full_description || null,
        icon_name: solution.icon_name,
        badge_text: solution.badge_text || null,
        specs,
        features,
        display_order: solution.display_order,
        is_active: solution.is_active,
      };

      if (isEditing && solution.id) {
        const { error } = await supabase.from("solutions").update(payload).eq("id", solution.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("solutions").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-solutions"] });
      setIsDialogOpen(false);
      setForm(defaultForm);
      setIsEditing(false);
      toast({ title: isEditing ? "Solution updated" : "Solution created" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("solutions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-solutions"] });
      toast({ title: "Solution deleted" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Open edit dialog
  const handleEdit = (solution: any) => {
    setForm({
      id: solution.id,
      name: solution.name,
      slug: solution.slug,
      short_description: solution.short_description,
      full_description: solution.full_description || "",
      icon_name: solution.icon_name,
      badge_text: solution.badge_text || "",
      specs: JSON.stringify(solution.specs || {}, null, 2),
      features: JSON.stringify(solution.features || [], null, 2),
      display_order: solution.display_order,
      is_active: solution.is_active,
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/horalix\s*/i, "")
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
              <h1 className="text-3xl font-bold font-space">Solutions</h1>
              <p className="text-muted-foreground mt-1">
                Manage product/solution pages.
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
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Solution
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Solution" : "New Solution"}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveMutation.mutate(form);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            name: e.target.value,
                            slug: isEditing ? form.slug : generateSlug(e.target.value),
                          });
                        }}
                        placeholder="Horalix Echo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="echo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Icon Name</Label>
                      <Input
                        value={form.icon_name}
                        onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
                        placeholder="Waves, ScanLine, Microscope, Activity"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Badge Text (optional)</Label>
                      <Input
                        value={form.badge_text}
                        onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
                        placeholder="New, Beta, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={form.display_order}
                        onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={form.is_active}
                        onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                      />
                      <Label>Active</Label>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Short Description</Label>
                      <Textarea
                        value={form.short_description}
                        onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                        rows={2}
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Full Description</Label>
                      <Textarea
                        value={form.full_description}
                        onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                        rows={6}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Specs (JSON object)</Label>
                      <Textarea
                        value={form.specs}
                        onChange={(e) => setForm({ ...form, specs: e.target.value })}
                        rows={4}
                        placeholder='{"MODEL": "CV-ResNet50", "ACCURACY": "99.4%"}'
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Features (JSON array)</Label>
                      <Textarea
                        value={form.features}
                        onChange={(e) => setForm({ ...form, features: e.target.value })}
                        rows={4}
                        placeholder='["Feature 1", "Feature 2"]'
                        className="font-mono text-sm"
                      />
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

          {/* Solutions table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
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
                ) : solutions && solutions.length > 0 ? (
                  solutions.map((solution) => (
                    <TableRow key={solution.id}>
                      <TableCell className="font-medium">{solution.name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        /solutions/{solution.slug}
                      </TableCell>
                      <TableCell>{solution.display_order}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            solution.is_active
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {solution.is_active ? "Active" : "Hidden"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(solution)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Delete this solution?")) {
                                deleteMutation.mutate(solution.id);
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
                      No solutions yet.
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

export default SolutionsManager;
