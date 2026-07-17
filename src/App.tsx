import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Archive from "./pages/Archive";
import Author from "./pages/Author";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminPost from "./pages/AdminPost";
import Posts from "./pages/admin/Posts";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import Categories from "./pages/admin/Categories";
import Gallery from "./pages/Gallery";
import AdminGallery from "./pages/admin/Gallery";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/post/:id" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/author/:id" element={<Author />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/posts" element={<Posts />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/gallery" element={<AdminGallery />} />
            <Route path="/admin/post/:id" element={<AdminPost />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;