import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, ChevronLeft, ChevronRight, X, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [activeEventImageIndex, setActiveEventImageIndex] = useState<number>(0);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    setLoading(true);
    try {
      // 1. Try to download metadata.json
      const { data: metaData, error: downloadError } = await supabase.storage
        .from("blog-images")
        .download("gallery/metadata.json");

      if (downloadError) {
        console.log("No metadata.json found or failed to load. Falling back to direct folder listing.");
        
        // 2. Fallback: List folder files directly
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
                description: "Science captured in action.",
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
      console.error("Error fetching gallery items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex === null) return;
    const activeItem = items[activeImageIndex];
    if (activeItem.images && activeItem.images.length > 1) {
      setActiveEventImageIndex((prev) => (prev > 0 ? prev - 1 : activeItem.images!.length - 1));
    } else {
      setActiveImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
      setActiveEventImageIndex(0);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex === null) return;
    const activeItem = items[activeImageIndex];
    if (activeItem.images && activeItem.images.length > 1) {
      setActiveEventImageIndex((prev) => (prev < activeItem.images!.length - 1 ? prev + 1 : 0));
    } else {
      setActiveImageIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
      setActiveEventImageIndex(0);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      const activeItem = items[activeImageIndex];
      if (e.key === "ArrowLeft") {
        if (activeItem.images && activeItem.images.length > 1) {
          setActiveEventImageIndex((prev) => (prev > 0 ? prev - 1 : activeItem.images!.length - 1));
        } else {
          setActiveImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
          setActiveEventImageIndex(0);
        }
      } else if (e.key === "ArrowRight") {
        if (activeItem.images && activeItem.images.length > 1) {
          setActiveEventImageIndex((prev) => (prev < activeItem.images!.length - 1 ? prev + 1 : 0));
        } else {
          setActiveImageIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
          setActiveEventImageIndex(0);
        }
      } else if (e.key === "Escape") {
        setActiveImageIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImageIndex, activeEventImageIndex, items]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8000ms]" />

      <Header />

      <main className="container max-w-6xl py-12 md:py-20 relative z-10">
        {/* RESTRUCTURED ASYMMETRICAL HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          {/* Left Column: Context & Typography */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10 animate-fade-in shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                [ Live Moments Archive ]
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent tracking-tight leading-[1.1] pb-1">
              Capturing Science. <br />
              <span className="text-foreground">Sharing Journeys.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              An archive of visual diaries, laboratory breakthroughs, and personal updates shaping the biotechnology landscape. Translating molecular exploration into visual notes.
            </p>

            {/* Premium Stats Rows */}
            <div className="pt-4 flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
              <div className="px-5 py-3 bg-card rounded-xl border border-border/80 shadow-sm flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div>
                  <span className="text-lg font-bold text-foreground mr-1">{items.length}</span>
                  <span className="text-xs text-muted-foreground">Captured Elements</span>
                </div>
              </div>
              <div className="px-5 py-3 bg-card rounded-xl border border-border/80 shadow-sm flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <div>
                  <span className="text-lg font-bold text-secondary mr-1">Cloud</span>
                  <span className="text-xs text-muted-foreground">Synced Archive</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Polaroid Stack Collage */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end h-[320px] sm:h-[380px] w-full select-none group">
            {/* Background scientific grid pattern for a high-tech custom feel */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(var(--primary-rgb),0.15)_1px,transparent_0)] [background-size:20px_20px] opacity-30 rounded-2xl pointer-events-none" />

            {/* Collage stack */}
            {items.length > 0 ? (
              <div className="relative w-[240px] sm:w-[280px] h-[300px] sm:h-[340px] mt-6 mr-4 sm:mr-8">
                {/* Back card */}
                {items[2] && (
                  <div className="absolute inset-0 bg-card border-4 border-white dark:border-zinc-900 rounded-lg shadow-md overflow-hidden transform rotate-[-8deg] -translate-x-8 translate-y-2 opacity-50 group-hover:rotate-[-15deg] group-hover:-translate-x-16 group-hover:-translate-y-4 transition-all duration-500 ease-out">
                    <img src={items[2].url} alt="" className="w-full h-[80%] object-cover" />
                    <div className="h-[20%] bg-white dark:bg-zinc-900 p-2 flex items-center">
                      <span className="text-[10px] font-semibold text-muted-foreground truncate">{items[2].title}</span>
                    </div>
                  </div>
                )}

                {/* Middle card */}
                {items[1] && (
                  <div className="absolute inset-0 bg-card border-4 border-white dark:border-zinc-900 rounded-lg shadow-lg overflow-hidden transform rotate-[6deg] translate-x-6 translate-y-1 opacity-75 group-hover:rotate-[12deg] group-hover:translate-x-16 group-hover:-translate-y-2 transition-all duration-500 ease-out">
                    <img src={items[1].url} alt="" className="w-full h-[80%] object-cover" />
                    <div className="h-[20%] bg-white dark:bg-zinc-900 p-2 flex items-center">
                      <span className="text-[10px] font-semibold text-muted-foreground truncate">{items[1].title}</span>
                    </div>
                  </div>
                )}

                {/* Front card */}
                {items[0] && (
                  <div className="absolute inset-0 bg-card border-4 border-white dark:border-zinc-900 rounded-lg shadow-xl overflow-hidden transform rotate-[-2deg] translate-x-0 translate-y-0 z-10 group-hover:scale-105 group-hover:-translate-y-6 transition-all duration-500 ease-out">
                    <img src={items[0].url} alt="" className="w-full h-[80%] object-cover" />
                    <div className="h-[20%] bg-white dark:bg-zinc-900 p-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-foreground truncate">{items[0].title}</span>
                      <span className="text-[8px] text-muted-foreground">{new Date(items[0].createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Abstract high-end biotech placeholder structures when gallery is empty
              <div className="relative w-[240px] sm:w-[280px] h-[300px] sm:h-[340px] mt-6 mr-4 sm:mr-8 flex items-center justify-center">
                <div className="absolute inset-0 border border-primary/20 rounded-2xl bg-primary/5 backdrop-blur-sm shadow-inner transform rotate-[-4deg]" />
                <div className="absolute inset-0 border border-secondary/20 rounded-2xl bg-secondary/5 backdrop-blur-sm shadow-md transform rotate-[4deg] translate-x-3 translate-y-2 group-hover:rotate-[8deg] group-hover:translate-x-6 transition-transform duration-500" />
                <div className="absolute inset-0 border border-border rounded-2xl bg-card/80 backdrop-blur-md shadow-lg flex flex-col items-center justify-center p-6 text-center z-10 group-hover:scale-105 transition-transform duration-500">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ImageIcon className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">Awaiting Moments</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
                    Curated content will be populated dynamically.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GALLERY GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse border border-border/40" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto border-dashed border-2">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold">No images in the gallery yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Check back soon, or upload images as an administrator.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveImageIndex(index);
                  setActiveEventImageIndex(0);
                }}
                className="group cursor-pointer relative transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Background stacks for event albums to look like a premium stack of photos */}
                {item.images && item.images.length > 1 && (
                  <>
                    <div className="absolute inset-0 bg-card/40 border border-primary/5 rounded-xl shadow-sm transform -rotate-3 translate-y-1.5 transition-transform duration-500 group-hover:-rotate-6 group-hover:translate-y-3 group-hover:-translate-x-2" />
                    <div className="absolute inset-0 bg-card/75 border border-primary/10 rounded-xl shadow-md transform rotate-2 translate-y-0.5 transition-transform duration-500 group-hover:rotate-4 group-hover:translate-y-1.5 group-hover:translate-x-2" />
                  </>
                )}

                <div className="relative bg-gradient-card border border-primary/10 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full bg-background z-10">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-background relative">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <h3 className="text-white text-lg font-bold tracking-tight line-clamp-1">{item.title}</h3>
                    </div>

                    {/* Event photo count badge */}
                    {item.images && item.images.length > 1 && (
                      <div className="absolute top-3 left-3 bg-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-20">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Event • {item.images.length} Photos</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-2 group-hover:bg-accent/50 transition-colors duration-300 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-md tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-300 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FULLSCREEN LIGHTBOX DIALOG */}
      <Dialog open={activeImageIndex !== null} onOpenChange={(open) => !open && setActiveImageIndex(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden bg-black/95 border-none shadow-2xl rounded-2xl flex flex-col md:flex-row h-[85vh] md:h-[70vh]">
          {activeImageIndex !== null && items[activeImageIndex] && (
            <>
              {/* Left Side: Interactive Image Viewer */}
              <div className="relative flex-1 bg-black flex flex-col items-center justify-center p-4 h-3/5 md:h-full select-none">
                {/* Photo counter overlay for events */}
                {items[activeImageIndex].images && items[activeImageIndex].images!.length > 1 && (
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded shadow z-10">
                    Photo {activeEventImageIndex + 1} of {items[activeImageIndex].images!.length}
                  </div>
                )}

                <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      items[activeImageIndex].images && items[activeImageIndex].images!.length > 0
                        ? items[activeImageIndex].images![activeEventImageIndex]?.url
                        : items[activeImageIndex].url
                    }
                    alt={items[activeImageIndex].title}
                    className="max-w-full max-h-[90%] object-contain select-none animate-fade-in"
                  />
                </div>

                {/* Left navigation arrow */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 z-10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                {/* Right navigation arrow */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 z-10"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Thumbnail strip for events at the bottom */}
                {items[activeImageIndex].images && items[activeImageIndex].images!.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2 overflow-x-auto py-2 px-4 bg-black/60 backdrop-blur-md rounded-xl max-w-[90%] mx-auto scrollbar-thin">
                    {items[activeImageIndex].images!.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveEventImageIndex(idx)}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                          activeEventImageIndex === idx
                            ? "border-primary scale-110 shadow-lg"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Photo Details Panel */}
              <div className="w-full md:w-80 bg-background border-t md:border-t-0 md:border-l border-border/40 p-6 flex flex-col justify-between h-2/5 md:h-full">
                <div className="space-y-4 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      <ImageIcon className="h-3 w-3" />
                      <span>
                        {items[activeImageIndex].images && items[activeImageIndex].images!.length > 1
                          ? "Event Album"
                          : "Gallery Story"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveImageIndex(null)}
                      className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold tracking-tight pt-1">
                    {items[activeImageIndex].title}
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pb-2 border-b border-border/40">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(items[activeImageIndex].createdAt).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      About this Moment
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                      {items[activeImageIndex].description || "No description provided for this moment."}
                    </p>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground border-t border-border/30 pt-4 mt-4">
                  {items[activeImageIndex].images && items[activeImageIndex].images!.length > 1 ? (
                    <span>Album {activeImageIndex + 1} of {items.length} ({items[activeImageIndex].images!.length} photos)</span>
                  ) : (
                    <span>Image {activeImageIndex + 1} of {items.length}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Gallery;
