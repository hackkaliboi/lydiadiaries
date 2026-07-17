import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Users, Eye, Home, Image, ArrowRight, Tag, Clock, CheckCircle, Edit, RefreshCw } from "lucide-react";

interface Stats {
  posts: number;
  users: number;
  views: number;
  drafts: number;
}

const Admin = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<Stats>({ posts: 0, users: 0, views: 0, drafts: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [adminUser, setAdminUser] = useState<any>(null);
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

      // Get authenticated user info
      const { data: { user } } = await supabase.auth.getUser();
      setAdminUser(user);

      // Fetch 3 recent posts
      const { data: recentData, error: recentError } = await supabase
        .from("blog_posts")
        .select("id, title, published, created_at, views")
        .order("created_at", { ascending: false })
        .limit(3);

      if (recentError) throw recentError;
      setRecentPosts(recentData || []);
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
      <div className="space-y-8 max-w-7xl animate-fade-in">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Control</h1>
            <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Secure Admin Session — Synced live with Cloud storage
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Loading control panel metrics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-gradient-card">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Published Posts</span>
                  <div className="p-1.5 bg-violet-500/10 rounded text-violet-500 animate-pulse">
                    <FileText className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tight">{stats.posts - stats.drafts}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Live articles on the site</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-gradient-card">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unpublished Drafts</span>
                  <div className="p-1.5 bg-yellow-500/10 rounded text-yellow-500">
                    <FileText className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tight">{stats.drafts}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">In-progress writing diaries</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-gradient-card">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Views</span>
                  <div className="p-1.5 bg-blue-500/10 rounded text-blue-500">
                    <Eye className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tight">{stats.views}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Across all notebook entries</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-gradient-card">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Registered Users</span>
                  <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-500">
                    <Users className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tight">{stats.users}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Authorized access list</p>
                </CardContent>
              </Card>
            </div>

            {/* Split Dashboard grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Quick Actions */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Management Console</h3>
                  <p className="text-xs text-muted-foreground">Select an administrative task to execute</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link to="/admin/post/new" className="group p-5 bg-card border border-border/60 rounded-xl hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-start gap-4 h-full">
                    <div className="p-3 rounded-lg bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform duration-300">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
                        Write Article
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">Compose a new biotechnology or diary entry</p>
                    </div>
                  </Link>

                  <Link to="/admin/posts" className="group p-5 bg-card border border-border/60 rounded-xl hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-start gap-4 h-full">
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
                        Manage Articles
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">Review, update, or unpublish your writing</p>
                    </div>
                  </Link>

                  <Link to="/admin/gallery" className="group p-5 bg-card border border-border/60 rounded-xl hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-start gap-4 h-full">
                    <div className="p-3 rounded-lg bg-pink-500/10 text-pink-500 group-hover:scale-110 transition-transform duration-300">
                      <Image className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
                        Manage Gallery
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">Add new images and edit description captions</p>
                    </div>
                  </Link>

                  <Link to="/admin/categories" className="group p-5 bg-card border border-border/60 rounded-xl hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-start gap-4 h-full">
                    <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500 group-hover:scale-110 transition-transform duration-300">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
                        Manage Categories
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">Organize stories into biotechnology sections</p>
                    </div>
                  </Link>

                  <Link to="/admin/users" className="group p-5 bg-card border border-border/60 rounded-xl hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-start gap-4 h-full sm:col-span-2">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
                        Manage Users & Access Roles
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">Audit profiles and permissions of system administrators and authors</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Right Column: Recent Activity & Status */}
              <div className="lg:col-span-5 space-y-6">
                {/* Recent Articles */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Recent Notebook Entries</h3>
                    <p className="text-xs text-muted-foreground">Latest articles written in the system</p>
                  </div>
                  <Card className="border-border/60 bg-gradient-card">
                    <CardContent className="p-4 divide-y divide-border/40">
                      {recentPosts.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No posts found in database.</p>
                      ) : (
                        recentPosts.map((post) => (
                          <div key={post.id} className="py-3 flex items-center justify-between gap-4 first:pt-1 last:pb-1 group">
                            <div className="min-w-0 flex-1 space-y-1">
                              <h5 className="font-bold text-xs truncate text-foreground group-hover:text-primary transition-colors">
                                {post.title}
                              </h5>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className={`h-1.5 w-1.5 rounded-full ${post.published ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                                <span>{post.published ? 'Published' : 'Draft'}</span>
                                <span>•</span>
                                <span>{post.views || 0} views</span>
                              </div>
                            </div>
                            <Button asChild size="icon" variant="ghost" className="h-7 w-7 rounded-full flex-shrink-0">
                              <Link to={`/admin/post/${post.id}`}>
                                <Edit className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* System Status card */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">System Status</h3>
                  </div>
                  <Card className="border-border/60 p-5 bg-gradient-card space-y-3">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-border/40">
                      <span className="text-muted-foreground">Database status</span>
                      <span className="font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Connected
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-border/40">
                      <span className="text-muted-foreground">Session account</span>
                      <span className="font-bold truncate max-w-[200px]" title={adminUser?.email}>
                        {adminUser?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Server Date</span>
                      <span className="font-medium text-foreground">
                        {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Admin;