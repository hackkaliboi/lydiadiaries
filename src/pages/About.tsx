import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Coffee, Beaker, GraduationCap, Compass, MapPin, Sparkles, BookOpen } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-6xl py-12 md:py-20">
        <div className="space-y-16 animate-fade-in">
          {/* Header Section */}
          {/* Restructured Asymmetrical About Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10 animate-fade-in shadow-sm">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">About Me</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight pb-1 leading-[1.1]">
                Welcome to my <br />
                <span className="font-serif italic font-normal bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">Corner</span> of the web.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Making science simple, relatable, and enjoyable. Exploring biotechnology, education, and lessons from my journey in Canada.
              </p>
            </div>
            
            <div className="lg:col-span-5 flex justify-center lg:justify-end select-none pointer-events-none">
              {/* Abstract scientific graphic */}
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center bg-primary/5 rounded-full blur-[30px] border border-primary/10">
                <svg className="w-32 h-32 text-primary/20 animate-[spin_30s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="50" cy="50" r="30" strokeDasharray="6 6" />
                  <circle cx="50" cy="50" r="40" strokeDasharray="12 4" />
                  <line x1="10" y1="50" x2="90" y2="50" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="50" y1="10" x2="50" y2="90" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="50" cy="20" r="4" fill="currentColor" className="text-primary/40 animate-ping" />
                  <circle cx="50" cy="80" r="4" fill="currentColor" className="text-secondary/40" />
                  <circle cx="20" cy="50" r="4" fill="currentColor" className="text-accent/40" />
                  <circle cx="80" cy="50" r="4" fill="currentColor" className="text-primary/40" />
                </svg>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            {/* Left side: Bio Card & Image */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="overflow-hidden bg-gradient-card border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-2 bg-muted/40">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-background border border-primary/5">
                    <img 
                      src="/about.png" 
                      alt="Nnenna Lydia Itodo - Science Communicator" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                  <h3 className="text-xl font-bold text-center">Nnenna Lydia Itodo</h3>
                  <p className="text-sm text-center text-muted-foreground font-medium">
                    Biotechnology Professional • Educator • Science Communicator
                  </p>
                  
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary/70 flex-shrink-0" />
                      <span>Based in Canada 🇨🇦</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Coffee className="h-4 w-4 text-primary/70 flex-shrink-0" />
                      <span>Coffee & conversations enthusiast</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Fun stats or quick numbers card */}
              <Card className="p-6 bg-gradient-card border-primary/10 shadow-md">
                <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Quick Highlights</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-sm font-medium">Favorite Subject</span>
                    <span className="text-xs bg-primary/5 px-2 py-1 rounded text-primary">Biotechnology</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-sm font-medium">Favorite Part of Science</span>
                    <span className="text-xs bg-primary/5 px-2 py-1 rounded text-primary">Communicating It</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Students Trained</span>
                    <span className="text-xs bg-primary/5 px-2 py-1 rounded text-primary">Hundreds</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right side: Biography story */}
            <div className="lg:col-span-7 space-y-8">
              {/* Introduction quote / lead */}
              <div className="border-l-4 border-primary pl-6 py-2 italic text-lg md:text-xl text-primary/80 leading-relaxed font-serif">
                "Have you ever wondered what scientists actually do in the lab? Or why a new scientific discovery matters to your everyday life? If so, you’re in the right place."
              </div>

              <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                <p>
                  Hi, I’m Lydia. Welcome to my little corner of the internet.
                </p>
                <p>
                  I’m <strong className="text-foreground">Nnenna Lydia Itodo</strong>, a biotechnology professional, educator, and science communicator with a passion for making science simple, relatable, and enjoyable.
                </p>
                <p>
                  Over the years, I’ve worked in molecular biology laboratories, contributed to research, trained hundreds of students, and discovered that my favourite part of science isn’t just doing it—it’s talking about it. I love taking complex ideas and turning them into conversations that anyone can enjoy.
                </p>
              </div>

              {/* The Core Belief Statement (Callout Card) */}
              <Card className="p-8 bg-primary/5 border-primary/10 rounded-xl relative overflow-hidden shadow-inner">
                <div className="absolute -right-8 -bottom-8 text-primary/5">
                  <Beaker className="h-40 w-40" />
                </div>
                <div className="relative z-10 space-y-3">
                  <span className="text-xs font-semibold text-primary/80 uppercase tracking-widest">My Mission</span>
                  <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
                    "I believe everyone deserves to understand the discoveries shaping our world, whether it’s a breakthrough in medicine, an amazing plant, a tiny insect with a big story, or a new technology changing the way we live."
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">
                    — That’s why I created Lydia Diaries.
                  </p>
                </div>
              </Card>

              {/* Cozy Coffee Quote */}
              <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                <p>
                  This is a space where learning feels less like a lecture and more like a conversation over a cup of coffee. A place where curiosity is always welcome and no question is too small.
                </p>
              </div>

              {/* What to expect grid */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">What You'll Find Here</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/40 rounded-lg border border-border/50 flex items-start gap-3">
                    <Beaker className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Science & Research</h4>
                      <p className="text-sm text-muted-foreground">Stories explaining complex scientific concepts and discoveries.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-lg border border-border/50 flex items-start gap-3">
                    <Compass className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Career Advice</h4>
                      <p className="text-sm text-muted-foreground">Lessons, practical tips, and resources from my professional journey.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-lg border border-border/50 flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Education & Training</h4>
                      <p className="text-sm text-muted-foreground">Reflections on biotechnology education, teaching, and mentorship.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-lg border border-border/50 flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Life in Canada</h4>
                      <p className="text-sm text-muted-foreground">Reflections and stories from adapting to a new chapter in Canada.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-lg border border-border/50 md:col-span-2 flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Behind-the-Scenes Diaries</h4>
                      <p className="text-sm text-muted-foreground">Occasional diary entries, reflections, and thoughts to put a smile on your face.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to action & Signature */}
              <div className="pt-6 border-t border-border space-y-6">
                <div className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Whether you’re a student, a professional, a fellow science enthusiast, or someone who simply enjoys learning, I’m so glad you’re here.
                  </p>
                  <p className="mt-3">
                    So, make yourself comfortable, explore, ask questions, and let’s learn something new together.
                  </p>
                </div>
                
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xl md:text-2xl font-serif italic font-bold text-foreground">— Lydia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
