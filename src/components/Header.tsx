import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAdmin } from "@/hooks/useAdmin";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { getSiteSettings } from "@/utils/settings";

const Header = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteTitle, setSiteTitle] = useState("Lydia's Diaries");

  useEffect(() => {
    setSiteTitle(getSiteSettings().siteTitle);

    const handleSettingsUpdate = () => {
      setSiteTitle(getSiteSettings().siteTitle);
    };

    window.addEventListener("site-settings-updated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("site-settings-updated", handleSettingsUpdate);
    };
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
      navigate('/');
    }
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Articles", href: "/archive" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            {siteTitle}
          </span>
        </Link>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
          <ThemeToggle />
          {user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <a href="#newsletter">Subscribe</a>
              </Button>
            </>
          )}
        </nav>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium py-2 transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{user.email?.split('@')[0]}</span>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <a href="#newsletter">Subscribe</a>
                  </Button>
                </div>
              )}
            </div>
            {user && isAdmin && (
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;