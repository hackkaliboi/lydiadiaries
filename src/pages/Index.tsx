import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import Newsletter from "@/components/Newsletter";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import AuthorCard from "@/components/AuthorCard";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { authors } from "@/data/blogPosts";
import heroBg from "@/assets/hero-bg.jpg";
import { TrendingUp } from "lucide-react";
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/utils/settings";

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

interface Author {
  id: string;
  full_name: string;
  bio: string;
  avatar_url?: string;
  postCount: number;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchPostsAndAuthors();
    setSettings(getSiteSettings());

    const handleSettingsUpdate = () => {
      setSettings(getSiteSettings());
    };

    window.addEventListener("site-settings-updated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("site-settings-updated", handleSettingsUpdate);
    };
  }, []);

  const fetchPostsAndAuthors = async () => {
    try {
      // Fetch posts
      const { data: posts, error: postsError } = await supabase
        .from("blog_posts")
        .select(`
          *,
          categories (name),
          profiles (full_name, avatar_url)
        `)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

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

      // Fetch authors and their post counts
      const { data: authorData, error: authorError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          bio,
          avatar_url
        `);

      if (authorError) throw authorError;

      // Calculate post counts for each author
      const authorsWithPostCounts: Author[] = (authorData || []).map((author) => {
        const postCount = formattedPosts.filter(post => post.authorId === author.id).length;
        return {
          ...author,
          postCount
        };
      });

      setAuthors(authorsWithPostCounts);
    } catch (error) {
      console.error("Error fetching posts and authors:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(blogPosts.map((post) => post.category)));

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured).slice(0, 2);
  const trendingPosts = [...blogPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

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

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-min-height">
        <div
          className="absolute inset-0 bg-gradient-hero opacity-95"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/90 dark:from-background/90 dark:via-background/60 dark:to-background/95" />

        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-2/3 right-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-72 md:h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="relative container py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and description */}
            <div className="lg:col-span-7 text-left text-primary-foreground space-y-6 sm:space-y-8 animate-fade-in">
              <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-2 animate-bounce-in">
                <span className="mr-2">✨</span>
                <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase">Welcome to {settings.siteTitle}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] animate-slide-in-up">
                Science, simplified. <br />
                <span className="font-serif italic font-normal bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">Stories, shared.</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-xl leading-relaxed animate-slide-in-up delay-150">
                {settings.siteDescription}
              </p>

              <div className="flex flex-wrap gap-4 pt-4 animate-slide-in-up delay-300">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 hover-scale shadow-lg hover:shadow-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300"
                  asChild
                >
                  <a href="#newsletter">Start Reading</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/15 text-white hover:text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link to="/about">About Lydia</Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Dynamic Content-Driven Glass Card */}
            <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end animate-fade-in delay-300">
              {(featuredPosts[0] || blogPosts[0]) && (() => {
                const heroPost = featuredPosts[0] || blogPosts[0];
                return (
                  <div className="w-full max-w-sm bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-2xl space-y-4 hover:border-white/25 transition-all duration-500 hover:scale-[1.02] group">
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-zinc-800">
                      <img 
                        src={heroPost.image || "/placeholder.svg"} 
                        alt={heroPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-md">
                        {heroPost.category}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-white/55 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Featured Story
                      </span>
                      <h3 className="text-white text-lg font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                        {heroPost.title}
                      </h3>
                      <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                        {heroPost.excerpt}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center font-bold text-white text-[10px] uppercase">
                          {heroPost.author.slice(0, 2)}
                        </div>
                        <span className="text-white/80 font-medium">{heroPost.author}</span>
                      </div>
                      <Button variant="link" className="text-white hover:text-accent p-0 h-auto text-xs" asChild>
                        <Link to={`/post/${heroPost.id}`}>Read Article →</Link>
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 sm:w-8 sm:h-12 rounded-full border-2 border-white/30 flex justify-center p-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/50 rounded-full animate-scroll-bounce" />
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="container py-12 sm:py-16">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Featured Articles</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Hand-picked stories worth your time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} {...post} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Posts Section */}
      <section className="container py-12 sm:py-16">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-2 text-center sm:text-left">
          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto sm:mx-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Trending Now</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {trendingPosts.map((post) => (
            <BlogCard key={post.id} {...post} />
          ))}
        </div>
      </section>

      {/* All Articles with Search and Filter */}
      <section className="container py-12 sm:py-16">
        <div className="mb-8 sm:mb-12 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">All Articles</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
            Explore our complete collection
          </p>

          <div className="space-y-4 sm:space-y-6">
            <SearchBar onSearch={setSearchQuery} />
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} {...post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-base sm:text-lg text-muted-foreground">No articles found matching your search.</p>
          </div>
        )}
      </section>

      {/* About the Author Section */}
      <section id="about-author" className="container py-16 md:py-24">
        <div className="bg-gradient-card border border-primary/10 rounded-2xl p-8 md:p-12 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Left: Picture */}
            <div className="md:col-span-4 flex justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-md transform rotate-[-2deg] hover:rotate-[0deg] transition-transform duration-300">
                <img 
                  src="/about.png" 
                  alt="Nnenna Lydia Itodo" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            {/* Right: Bio details */}
            <div className="md:col-span-8 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 text-xs font-semibold tracking-wider text-primary uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Meet the Author
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Nnenna Lydia Itodo</h2>
                <p className="text-sm font-semibold text-primary/80 uppercase tracking-widest font-mono">
                  Biotechnology Professional • Educator • Science Communicator
                </p>
              </div>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                I believe everyone deserves to understand the discoveries shaping our world. From molecular research to daily conversations over coffee, I make science simple, relatable, and enjoyable. Based in Canada, sharing reflections from my journey.
              </p>

              <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                <Button asChild size="sm" className="px-6">
                  <Link to="/about">Read My Full Story</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="px-6 bg-transparent">
                  <Link to="/gallery">View Gallery</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="container py-12 sm:py-16">
        <Newsletter />
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;