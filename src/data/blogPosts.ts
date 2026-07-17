import blog1 from "@/assets/blog1.jpg";
import blog2 from "@/assets/blog2.jpg";
import blog3 from "@/assets/blog3.jpg";

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  image: string;
  author: string;
  authorId: string;
  featured?: boolean;
  views?: number;
}

export const authors: Author[] = [
  {
    id: "nnena-itodo",
    name: "Nnenna Lydia Itodo",
    bio: "Biotechnology professional, educator, and science communicator with a passion for making science simple, relatable, and enjoyable."
  }
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Wonders of Quantum Physics",
    excerpt: "Discover the fascinating world of quantum mechanics and how it's revolutionizing our understanding of reality.",
    content: `Quantum physics is one of the most intriguing and mind-bending fields in modern science. It challenges our everyday understanding of reality and opens up possibilities that seem almost magical.

At the heart of quantum mechanics lies the principle of superposition, where particles can exist in multiple states simultaneously until observed. This concept has led to groundbreaking technologies like quantum computers, which promise to solve problems that are impossible for classical computers.

Another fascinating aspect is quantum entanglement, where particles become mysteriously connected regardless of distance. Einstein famously called this "spooky action at a distance," but it's now a proven phenomenon with practical applications in quantum communication and cryptography.

The uncertainty principle, formulated by Werner Heisenberg, tells us that we cannot know both the position and momentum of a particle with perfect precision. This fundamental limit on knowledge has profound implications for our understanding of the universe.

Quantum tunneling allows particles to pass through barriers that should be insurmountable, a phenomenon that enables nuclear fusion in stars and is essential for many modern technologies.

As we continue to explore the quantum realm, we're discovering new applications in computing, medicine, and materials science that could transform our world in ways we're only beginning to imagine.`,
    category: "Science",
    tags: ["Physics", "Quantum Mechanics", "Research"],
    date: "Mar 15, 2024",
    readTime: "5 min read",
    image: blog1,
    author: "Nnenna Lydia Itodo",
    authorId: "nnena-itodo",
    featured: true,
    views: 1243
  },
  {
    id: "2",
    title: "Exploring the Cosmos: Recent Discoveries in Astronomy",
    excerpt: "Learn about the latest breakthrough discoveries in astronomy and what they tell us about our universe.",
    content: `The universe continues to surprise us with new discoveries that expand our understanding of cosmic phenomena. Recent advances in telescope technology and space exploration have revealed fascinating insights about our cosmos.

The James Webb Space Telescope has provided unprecedented views of distant galaxies, allowing us to peer back in time to the early universe. These observations are helping scientists understand how galaxies formed and evolved over billions of years.

Dark matter and dark energy remain two of the biggest mysteries in cosmology. While we can't see them directly, their effects on the universe's expansion and structure are undeniable. Scientists estimate that dark matter makes up about 27% of the universe, while dark energy accounts for roughly 68%.

Exoplanet discoveries continue to accelerate, with thousands of worlds found orbiting other stars. Some of these planets lie in the habitable zone where liquid water could exist, raising exciting possibilities for extraterrestrial life.

Gravitational wave astronomy has opened an entirely new window for observing the universe. These ripples in spacetime, predicted by Einstein's theory of general relativity, allow us to detect cataclysmic events like colliding black holes and neutron stars.

The search for life beyond Earth continues with missions to Mars, Europa, and Enceladus. Scientists are looking for biosignatures—chemical indicators of life—in the atmospheres of exoplanets and in samples from our own solar system.

Each new discovery brings us closer to answering fundamental questions about our place in the universe and the nature of reality itself.`,
    category: "Science",
    tags: ["Astronomy", "Space Exploration", "Cosmology"],
    date: "Mar 12, 2024",
    readTime: "7 min read",
    image: blog2,
    author: "Nnenna Lydia Itodo",
    authorId: "nnena-itodo",
    featured: false,
    views: 892
  },
  {
    id: "3",
    title: "Breakthroughs in Medical Science",
    excerpt: "Exploring recent advances in medical research and how they're transforming healthcare.",
    content: `Medical science is advancing at an unprecedented pace, with breakthrough discoveries that are revolutionizing healthcare and offering new hope for patients worldwide.

Gene therapy has emerged as a powerful tool for treating genetic disorders. By introducing healthy genes into cells, scientists can potentially cure diseases that were once considered incurable. Recent successes include treatments for inherited blindness and certain types of childhood leukemia.

CRISPR gene editing technology is revolutionizing our ability to modify DNA with precision. This tool allows scientists to make targeted changes to genes, opening up possibilities for treating genetic diseases, improving crops, and even combating climate change.

Immunotherapy is transforming cancer treatment by harnessing the body's own immune system to fight tumors. CAR-T cell therapy, for example, modifies a patient's T cells to better recognize and attack cancer cells, showing remarkable success in treating certain blood cancers.

Artificial intelligence is playing an increasingly important role in medical diagnosis and drug discovery. Machine learning algorithms can analyze medical images with superhuman accuracy and identify potential drug candidates much faster than traditional methods.

Personalized medicine is becoming a reality as scientists learn to tailor treatments based on individual genetic profiles. This approach promises to make treatments more effective while reducing side effects.

Telemedicine and digital health technologies are expanding access to healthcare, particularly in underserved areas. Remote monitoring devices and mobile health apps are empowering patients to take a more active role in managing their health.

These advances represent just the beginning of what's possible as we continue to push the boundaries of medical science.`,
    category: "Science",
    tags: ["Medical Research", "Biotechnology", "Healthcare"],
    date: "Mar 10, 2024",
    readTime: "6 min read",
    image: blog3,
    author: "Nnenna Lydia Itodo",
    authorId: "nnena-itodo",
    featured: true,
    views: 1567
  }
];