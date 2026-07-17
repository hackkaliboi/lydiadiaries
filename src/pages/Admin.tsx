import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Users, Eye, Home, Image } from "lucide-react";

interface Stats {
  posts: number;
  users: number;
  views: number;
  drafts: number;
}

const Admin = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<Stats>({ posts: 0, users: 0, views: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      // Fetch posts count
      const { count: postsCount, error: postsError } = await supabase
        .from("blog_posts")
        .select("*", { count: "exact", head: true });

      if (postsError) throw postsError;

      // Fetch drafts count
      const { count: draftsCount, error: draftsError } = await supabase
        .from("blog_posts")
        .select("*", { count: "exact", head: true })
        .eq("published", false);

      if (draftsError) throw draftsError;

      // Fetch users count
      const { count: usersCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (usersError) throw usersError;

      // Fetch total views (sum of all post views)
      const { data: viewsData, error: viewsError } = await supabase
        .from("blog_posts")
        .select("views");

      if (viewsError) throw viewsError;

      // Calculate total views
      const totalViews = viewsData.reduce((sum, post) => sum + (post.views || 0), 0);

      setStats({
        posts: postsCount || 0,
        users: usersCount || 0,
        views: totalViews,
        drafts: draftsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard stats.",
      });
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your admin dashboard</p>
          </div>
          {/* Removed the duplicate "Back to Site" button since it's already in the sidebar */}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.posts}</div>
                  <p className="text-xs text-muted-foreground">Published posts</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.drafts}</div>
                  <p className="text-xs text-muted-foreground">Unpublished posts</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.views}</div>
                  <p className="text-xs text-muted-foreground">Total views</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users}</div>
                  <p className="text-xs text-muted-foreground">Active users</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button asChild className="h-20 flex flex-col gap-2">
                <Link to="/admin/post/new">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">New Post</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link to="/admin/posts">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Manage Posts</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link to="/admin/users">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Manage Users</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link to="/admin/gallery">
                  <Image className="h-6 w-6 text-primary" />
                  <span className="text-sm">Manage Gallery</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link to="/admin/settings">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">Settings</span>
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Admin;