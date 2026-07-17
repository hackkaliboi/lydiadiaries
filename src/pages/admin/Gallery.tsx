import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload, Trash2, Edit3, Save, X, Calendar, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GalleryItem {
  id: string;
  filename: string;
  url: string;
  title: string;
  description: string;
  createdAt: string;
}

const AdminGallery = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload States
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Edit States
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
      });
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchGalleryItems();
    }
  }, [isAdmin]);

  const fetchGalleryItems = async () => {
    setLoading(true);
    try {
      const { data: metaData, error: downloadError } = await supabase.storage
        .from("blog-images")
        .download("gallery/metadata.json");

      if (downloadError) {
        // Fallback: list the folder contents
        const { data: files, error: listError } = await supabase.storage
          .from("blog-images")
          .list("gallery");

        if (listError) throw listError;

        if (files) {
          const mappedItems = files
            .filter((f) => f.name !== "metadata.json" && f.name !== ".emptyKeep" && f.name !== ".placeholder")
            .map((f) => {
              const { data: { publicUrl } } = supabase.storage
                .from("blog-images")
                .getPublicUrl(`gallery/${f.name}`);

              return {
                id: f.id || f.name,
                filename: f.name,
                url: publicUrl,
                title: f.name.split(".")[0].replace(/[-_]/g, " "),
                description: "",
                createdAt: f.created_at || new Date().toISOString(),
              };
            });
          setItems(mappedItems);
        }
      } else if (metaData) {
        const text = await metaData.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading gallery items:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load gallery items.",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMetadata = async (updatedItems: GalleryItem[]) => {
    const jsonString = JSON.stringify(updatedItems, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    
    const { error } = await supabase.storage
      .from("blog-images")
      .upload("gallery/metadata.json", blob, {
        upsert: true,
        contentType: "application/json",
      });

    if (error) throw error;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate title if empty
      if (!newTitle) {
        const nameWithoutExt = file.name.split(".").slice(0, -1).join(".");
        setNewTitle(nameWithoutExt.replace(/[-_]/g, " "));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select an image to upload.",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}_gallery.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      // 1. Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      // 3. Update state & save metadata
      const newItem: GalleryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        filename: fileName,
        url: publicUrl,
        title: newTitle || fileName.split(".")[0],
        description: newDescription,
        createdAt: new Date().toISOString(),
      };

      const updatedItems = [newItem, ...items];
      await saveMetadata(updatedItems);
      
      setItems(updatedItems);
      setNewTitle("");
      setNewDescription("");
      setSelectedFile(null);
      
      // Reset input element
      const fileInput = document.getElementById("gallery-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      toast({
        title: "Success",
        description: "Gallery image uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "An error occurred while uploading the image.",
      });
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const updatedItems = items.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            title: editTitle,
            description: editDescription,
          };
        }
        return item;
      });

      await saveMetadata(updatedItems);
      setItems(updatedItems);
      setEditingItem(null);
      
      toast({
        title: "Updated",
        description: "Image details updated successfully.",
      });
    } catch (error) {
      console.error("Error updating item metadata:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update image details.",
      });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      // 1. Remove file from storage
      const filePath = `gallery/${itemToDelete.filename}`;
      const { error: removeError } = await supabase.storage
        .from("blog-images")
        .remove([filePath]);

      if (removeError) throw removeError;

      // 2. Remove from metadata list and upload updated JSON
      const updatedItems = items.filter((item) => item.id !== itemToDelete.id);
      await saveMetadata(updatedItems);
      setItems(updatedItems);

      toast({
        title: "Deleted",
        description: "Image deleted successfully from gallery.",
      });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not remove the image from storage/gallery.",
      });
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  // Show loading state when checking admin status
  if (adminLoading) {
    return null;
  }

  // Show nothing if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gallery Manager</h1>
            <p className="text-muted-foreground">Manage and upload photos for the public gallery page</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchGalleryItems} disabled={loading} className="gap-2 self-start">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* UPLOAD CARD */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload New Photo
                </CardTitle>
                <CardDescription>
                  Add a new image, caption, and details to the gallery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gallery-file">Select Image</Label>
                    <Input
                      id="gallery-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground truncate">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Photo Title</Label>
                    <Input
                      id="title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Exploring plant cells in the lab"
                      required
                      disabled={uploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Caption / Description</Label>
                    <Textarea
                      id="description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Add background story or science explanation..."
                      rows={3}
                      disabled={uploading}
                      className="resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? "Uploading Image..." : "Upload to Gallery"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* LIST GRID */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Existing Images ({items.length})
                </CardTitle>
                <CardDescription>
                  List of current images featured in the public gallery
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Loading gallery items...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                    <p className="text-sm font-medium">No images uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <Card key={item.id} className="overflow-hidden border border-border/60 hover:shadow-md transition-shadow">
                        <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                          <img
                            src={item.url}
                            alt={item.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <CardContent className="p-4 space-y-2">
                          <h4 className="font-bold text-sm line-clamp-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                            {item.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="pt-2 flex gap-2 border-t border-border/40 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(item)}
                              className="flex-1 text-xs gap-1.5 h-8"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setItemToDelete(item)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 text-xs gap-1.5 h-8"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Dialog open={editingItem !== null} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Photo Details</DialogTitle>
            <DialogDescription>
              Update the title and caption for this gallery photo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Photo Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Caption / Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the photo from the gallery and remove it from Supabase storage.
            </DialogDescription>
          </DialogHeader>
          {itemToDelete && (
            <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
              <img
                src={itemToDelete.url}
                alt={itemToDelete.title}
                className="w-12 h-12 object-cover rounded-md"
              />
              <span className="text-sm font-semibold truncate flex-1">{itemToDelete.title}</span>
            </div>
          )}
          <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setItemToDelete(null)} disabled={deleting} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="flex-1">
              {deleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminGallery;
