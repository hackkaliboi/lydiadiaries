import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-4xl py-16">
        <div className="space-y-12 animate-fade-in">
          <div className="space-y-4 text-center">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
              <span className="text-sm font-medium text-primary">Our Story</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              About Lydia's Diaries
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern platform for sharing ideas and stories that matter
            </p>
          </div>

          <Card className="p-8 md:p-12 bg-gradient-card border-primary/10 hover-scale transition-all duration-300">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                Welcome to Lydia's Diaries, where creativity meets technology. We're passionate about 
                providing a platform for writers, designers, and thinkers to share their insights 
                with the world.
              </p>
              <p className="text-lg leading-relaxed">
                Our mission is to create a beautiful, distraction-free reading experience that 
                puts content first. We believe that great ideas deserve great presentation, and 
                we've built our platform with that philosophy in mind.
              </p>
              <p className="text-lg leading-relaxed">
                Whether you're here to read about design, productivity, technology, or any other 
                topic, we hope you find inspiration and value in our carefully curated content.
              </p>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-8 text-center bg-gradient-card border-primary/10 hover-scale transition-all duration-300 group">
              <div className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                500+
              </div>
              <div className="text-muted-foreground font-medium">Articles Published</div>
            </Card>
            <Card className="p-8 text-center bg-gradient-card border-primary/10 hover-scale transition-all duration-300 group">
              <div className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                50K+
              </div>
              <div className="text-muted-foreground font-medium">Monthly Readers</div>
            </Card>
            <Card className="p-8 text-center bg-gradient-card border-primary/10 hover-scale transition-all duration-300 group">
              <div className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                100+
              </div>
              <div className="text-muted-foreground font-medium">Contributors</div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
