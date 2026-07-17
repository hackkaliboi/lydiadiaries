import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  slug: string;
  category: string;
  author: string;
  authorId: string;
  date: string;
  readTime: string;
  views: number;
  tags: string[];
  featured?: boolean;
  image: string;
}

const Archive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          categories (name),
          profiles (full_name)
        `)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedPosts: BlogPost[] = (posts || []).map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image,
        slug: post.slug,
        category: post.categories?.name || "Uncategorized",
        author: post.profiles?.full_name || "Anonymous",
        authorId: post.author_id,
        date: new Date(post.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        readTime: `${post.reading_time || 5} min read`,
        views: post.views || 0,
        tags: [],
        image: post.cover_image || "",
        featured: post.featured || false,
      }));

      setBlogPosts(formattedPosts);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(formattedPosts.map((post) => post.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

  const postsByMonth = filteredPosts.reduce((acc, post) => {
    const month = post.date.split(" ")[0] + " " + post.date.split(" ")[2];
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(post);
    return acc;
  }, {} as Record<string, typeof blogPosts>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-16">
        <div className="max-w-4xl mx-auto mb-16 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10 animate-fade-in shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">
              // The Complete Archive
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight pb-1 leading-[1.1]">
            Scientific <span className="font-serif italic font-normal bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">Notebooks</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Browse through all articles, research summaries, and career guides. Use the search bar and category filters below to explore specific subjects.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground justify-center md:justify-start">
            <div className="px-4 py-2 bg-card rounded-xl border border-border shadow-sm flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{blogPosts.length}</span>
              <span>Published Articles</span>
            </div>
            <div className="px-4 py-2 bg-card rounded-xl border border-border shadow-sm flex items-center gap-2">
              <span className="text-sm font-bold text-primary">{categories.length}</span>
              <span>Explored Fields</span>
            </div>
          </div>

          <div className="pt-6 space-y-6">
            <SearchBar onSearch={setSearchQuery} />
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>

        <div className="space-y-12">
          {Object.entries(postsByMonth).map(([month, posts]) => (
            <div key={month}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                {month}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <BlogCard key={post.id} {...post} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No articles found matching your criteria.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Archive;