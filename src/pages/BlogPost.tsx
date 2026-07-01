import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { authors } from "@/data/blogPosts";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadingProgress from "@/components/ReadingProgress";
import SocialShare from "@/components/SocialShare";
import CommentSection from "@/components/CommentSection";
import PostInteractions from "@/components/PostInteractions";
import BackToTop from "@/components/BackToTop";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Eye, User } from "lucide-react";
import { updatePageSEO, generateStructuredData } from "@/utils/seo";

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
  image: string;
}

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const commentSectionRef = useRef<HTMLDivElement>(null);
  const author = post ? authors.find(a => a.id === post.authorId) : null;

  useEffect(() => {
    console.log("BlogPost component mounted with id:", id);
    if (!id) {
      console.error("No post ID provided in URL");
      setLoading(false);
      return;
    }

    // Validate that id looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error("Invalid post ID format:", id);
      setLoading(false);
      return;
    }

    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    console.log("Fetching post with id:", id);

    if (!id) {
      console.error("No post ID provided");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          categories (name),
          profiles (full_name)
        `)
        .eq("id", id)
        .eq("published", true)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
        throw error;
      }

      if (data) {
        console.log("Successfully fetched post:", data);
        // Increment views
        await supabase
          .from("blog_posts")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", id);

        const formattedPost: BlogPost = {
          id: data.id,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          cover_image: data.cover_image,
          slug: data.slug,
          category: data.categories?.name || "Uncategorized",
          author: data.profiles?.full_name || "Anonymous",
          authorId: data.author_id,
          date: new Date(data.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          readTime: `${data.reading_time || 5} min read`,
          views: (data.views || 0) + 1,
          tags: [],
          image: data.cover_image || "",
        };

        setPost(formattedPost);

        updatePageSEO({
          title: `${formattedPost.title} | Lydia's Diaries`,
          description: formattedPost.excerpt,
          type: "article",
          author: formattedPost.author,
          keywords: [formattedPost.category],
          canonical: `${window.location.origin}/post/${formattedPost.id}`,
        });

        generateStructuredData("article", {
          title: formattedPost.title,
          description: formattedPost.excerpt,
          image: formattedPost.image,
          datePublished: formattedPost.date,
          author: formattedPost.author,
        });
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToComments = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Loading post...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post not found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Header />

      <article className="container max-w-4xl py-12">
        <Breadcrumbs
          items={[
            { label: post.category, href: `/?category=${post.category}` },
            { label: post.title }
          ]}
        />

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{post.category}</Badge>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <Link
                to={`/author/${post.authorId}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="font-medium">{post.author}</span>
              </Link>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
              {post.views && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views} views</span>
                </div>
              )}
            </div>

            {/* Replace SocialShare with PostInteractions */}
            <PostInteractions postId={post.id} onCommentClick={scrollToComments} />
          </div>

          <div className="aspect-[21/9] overflow-hidden rounded-xl">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div
            className="prose prose-lg max-w-none pt-8 prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {author && (
            <div className="mt-12 p-6 border border-border rounded-xl bg-gradient-card">
              <h3 className="text-lg font-bold mb-3">About the Author</h3>
              <Link
                to={`/author/${author.id}`}
                className="flex items-start gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">{author.name}</p>
                  <p className="text-sm text-muted-foreground">{author.bio}</p>
                </div>
              </Link>
            </div>
          )}

          {/* Add ref to comment section for scrolling */}
          <div ref={commentSectionRef}>
            <CommentSection postId={post.id} />
          </div>
        </div>
      </article>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default BlogPost;