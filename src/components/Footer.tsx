import { Link } from "react-router-dom";
import { Mail, Twitter, Instagram } from "lucide-react";

// TikTok icon as a custom SVG since it's not available in lucide-react
const TikTok = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Lydia's Diaries
            </h3>
            <p className="text-sm text-muted-foreground">
              A modern platform for sharing scientific insights and discoveries. Explore the latest research in physics, astronomy, and medical science.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/archive" className="text-muted-foreground hover:text-primary transition-colors">
                  Articles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/?category=Science" className="text-muted-foreground hover:text-primary transition-colors">
                  Science
                </Link>
              </li>
              <li>
                <Link to="/?category=Research" className="text-muted-foreground hover:text-primary transition-colors">
                  Research
                </Link>
              </li>
              <li>
                <Link to="/?category=Technology" className="text-muted-foreground hover:text-primary transition-colors">
                  Technology
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="https://x.com/nnennalydia?s=11&t=rQjxzJkTWMA51t1No54hrg" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@nnennalydia?_t=ZM-90tiAa1A3gJ&_r=1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <TikTok />
              </a>
              <a href="https://www.instagram.com/nnennaitodo?igsh=NmozcmhhMDhoY2J6&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Lydia's Diaries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;