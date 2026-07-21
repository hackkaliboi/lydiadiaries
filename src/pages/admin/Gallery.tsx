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

interface GalleryItemImage {
  id: string;
  filename: string;
  url: string;
}

interface GalleryItem {
  id: string;
  filename: string;
  url: string;
  title: string;
  description: string;
  createdAt: string;
  type?: "single" | "event";
  images?: GalleryItemImage[];
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverFileIndex, setCoverFileIndex] = useState<number>(0);

  // Edit States
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      // Clear old previews
      previews.forEach((url) => URL.revokeObjectURL(url));
      
      setSelectedFiles(files);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
      setCoverFileIndex(0);

      // Auto-populate title if empty and we have a file
      if (!newTitle && files.length > 0) {
        const nameWithoutExt = files[0].name.split(".").slice(0, -1).join(".");
        setNewTitle(nameWithoutExt.replace(/[-_]/g, " "));
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    
    if (coverFileIndex === index) {
      setCoverFileIndex(0);
    } else if (coverFileIndex > index) {
      setCoverFileIndex(coverFileIndex - 1);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No Files Selected",
        description: "Please select at least one image to upload.",
      });
      return;
    }

    setUploading(true);
    try {
      const uploadedImages: GalleryItemImage[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${i}_gallery.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        // 1. Upload file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from("blog-images")
          .getPublicUrl(filePath);

        uploadedImages.push({
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + i),
          filename: fileName,
          url: publicUrl,
        });
      }

      // Reorder so the chosen cover image is at index 0
      const coverImage = uploadedImages[coverFileIndex] || uploadedImages[0];
      const orderedImages = [
        coverImage,
        ...uploadedImages.filter((_, idx) => idx !== coverFileIndex)
      ];

      // 3. Update state & save metadata
      const newItem: GalleryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        filename: coverImage.filename,
        url: coverImage.url,
        title: newTitle || coverImage.filename.split(".")[0],
        description: newDescription,
        createdAt: new Date().toISOString(),
        type: selectedFiles.length > 1 ? "event" : "single",
        images: orderedImages,
      };

      const updatedItems = [newItem, ...items];
      await saveMetadata(updatedItems);
      
      setItems(updatedItems);
      setNewTitle("");
      setNewDescription("");
      setSelectedFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
      setCoverFileIndex(0);
      
      // Reset input element
      const fileInput = document.getElementById("gallery-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      toast({
        title: "Success",
        description: selectedFiles.length > 1 
          ? `Event album uploaded with ${selectedFiles.length} photos.`
          : "Gallery image uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image(s):", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "An error occurred while uploading the image(s).",
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
      // 1. Remove files from storage
      const filePathsToDelete = itemToDelete.images && itemToDelete.images.length > 0
        ? itemToDelete.images.map((img) => `gallery/${img.filename}`)
        : [`gallery/${itemToDelete.filename}`];

      const { error: removeError } = await supabase.storage
        .from("blog-images")
        .remove(filePathsToDelete);

      if (removeError) throw removeError;

      // 2. Remove from metadata list and upload updated JSON
      const updatedItems = items.filter((item) => item.id !== itemToDelete.id);
      await saveMetadata(updatedItems);
      setItems(updatedItems);

      toast({
        title: "Deleted",
        description: "Gallery item deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting gallery image(s):", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not remove the image(s) from storage/gallery.",
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
                    <Label htmlFor="gallery-file">Select Images</Label>
                    <Input
                      id="gallery-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple
                      required
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Selected ({selectedFiles.length}): Choose a cover photo
                        </p>
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-muted/50 rounded-lg border border-border/40">
                          {previews.map((preview, index) => (
                            <div
                              key={preview}
                              onClick={() => setCoverFileIndex(index)}
                              className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                                coverFileIndex === index
                                  ? "border-primary shadow-sm scale-95"
                                  : "border-transparent opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={preview}
                                alt={`Selected preview ${index}`}
                                className="w-full h-full object-cover"
                              />
                              {coverFileIndex === index && (
                                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                                  Cover
                                </div>
                              )}
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(index);
                                }}
                                className="absolute top-1 right-1 h-4 w-4 rounded-full p-0 shadow-sm"
                              >
                                <X className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Photo Title / Event Title</Label>
                    <Input
                      id="title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Biotech Symposium 2026"
                      required
                      disabled={uploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Caption / Description (Large captions allowed)</Label>
                    <Textarea
                      id="description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Add background story, science explanation, or event diary details..."
                      rows={4}
                      disabled={uploading}
                      className="resize-y"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? `Uploading ${selectedFiles.length} file(s)...` : "Upload to Gallery"}
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
                          {item.images && item.images.length > 1 && (
                            <div className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                              Event • {item.images.length} Photos
                            </div>
                          )}
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
              {itemToDelete?.images && itemToDelete.images.length > 1
                ? `This will permanently delete the event "${itemToDelete.title}" and all its ${itemToDelete.images.length} photos from Supabase storage.`
                : "This will permanently delete the photo from the gallery and remove it from Supabase storage."}
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
