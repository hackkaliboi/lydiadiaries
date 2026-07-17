import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Heart, MessageCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

const BlogCard = ({ id, title, excerpt, category, date, readTime, image }: BlogCardProps) => {
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInteractionCounts();
    }
  }, [id]);

  const fetchInteractionCounts = async () => {
    if (!id) return;

    try {
      // Get likes count - direct query instead of RPC
      const { count: likesCount, error: likesError } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);

      if (!likesError && likesCount !== null) {
        setLikesCount(likesCount);
      }

      // Get comments count - direct query instead of RPC
      const { count: commentsCount, error: commentsError } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);

      if (!commentsError && commentsCount !== null) {
        setCommentsCount(commentsCount);
      }

      // Get shares count - direct query instead of RPC
      const { count: sharesCount, error: sharesError } = await supabase
        .from("shares")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);

      if (!sharesError && sharesCount !== null) {
        setSharesCount(sharesCount);
      }
    } catch (error) {
      console.error("Error fetching interaction counts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/post/${id}`} className="group h-full block">
      <Card className="overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 bg-gradient-card border border-primary/5 hover:border-primary/15 h-full flex flex-col">
        <div className="aspect-[16/9] overflow-hidden bg-muted relative">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="w-full h-full bg-muted flex items-center justify-center">
                  <span class="text-muted-foreground text-xs font-semibold">Image not available</span>
                </div>
              `;
            }}
          />
        </div>
        <div className="p-6 space-y-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-primary/5 text-primary border border-primary/10">
              {category}
            </Badge>
          </div>
          <h3 className="text-xl font-serif font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1 leading-relaxed">
            {excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{readTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <Heart className="h-3.5 w-3.5" />
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{commentsCount}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-green-500 transition-colors">
              <Share2 className="h-3.5 w-3.5" />
              <span>{sharesCount}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;