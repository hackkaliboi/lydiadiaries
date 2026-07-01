import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { updatePageSEO, generateStructuredData } from "@/utils/seo";

interface Author {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url?: string | null;
}

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

const Author = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState<Author | null>(null);
  const [authorPosts, setAuthorPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAuthorAndPosts();
    }
  }, [id]);

  const fetchAuthorAndPosts = async () => {
    try {
      // Fetch author
      const { data: authorData, error: authorError } = await supabase
        .from("profiles")
        .select("id, full_name, bio, avatar_url")
        .eq("id", id)
        .single();

      if (authorError) throw authorError;

      if (authorData) {
        setAuthor(authorData);

        // Update SEO
        updatePageSEO({
          title: `${authorData.full_name || "Unknown Author"} - Author | Lydia's Diaries`,
          description: authorData.bio || "",
          canonical: `${window.location.origin}/author/${authorData.id}`,
        });

        generateStructuredData("person", {
          name: authorData.full_name || "Unknown Author",
          bio: authorData.bio || "",
          id: authorData.id,
        });

        // Fetch author's posts
        const { data: posts, error: postsError } = await supabase
          .from("blog_posts")
          .select(`
            *,
            categories (name),
            profiles (full_name)
          `)
          .eq("author_id", id)
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

        setAuthorPosts(formattedPosts);
      }
    } catch (error) {
      console.error("Error fetching author and posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading author...</p>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Author not found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-16">
        <Breadcrumbs
          items={[
            { label: "Authors", href: "/#contributors" },
            { label: author.full_name || "Unknown Author" }
          ]}
        />

        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex items-start gap-6 mb-6">
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.full_name || "Author"}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-12 w-12 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{author.full_name || "Unknown Author"}</h1>
              <p className="text-lg text-muted-foreground mb-4">{author.bio || "No bio available."}</p>
              <p className="text-sm text-primary font-medium">
                {authorPosts.length} {authorPosts.length === 1 ? "article" : "articles"} published
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-8">Articles by {author.full_name || "Unknown Author"}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authorPosts.map((post) => (
              <BlogCard key={post.id} {...post} />
            ))}
          </div>
        </div>

        {authorPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No articles yet.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Author;