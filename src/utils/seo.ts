export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: "website" | "article";
}

export const updatePageSEO = (data: SEOData) => {
  // Update title
  document.title = data.title;

  // Update or create meta tags
  const setMetaTag = (name: string, content: string, property?: boolean) => {
    const attribute = property ? "property" : "name";
    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute("content", content);
  };

  // Standard meta tags
  setMetaTag("description", data.description);
  if (data.author) setMetaTag("author", data.author);
  if (data.keywords) setMetaTag("keywords", data.keywords.join(", "));

  // Open Graph tags
  setMetaTag("og:title", data.title, true);
  setMetaTag("og:description", data.description, true);
  setMetaTag("og:type", data.type || "website", true);
  if (data.ogImage) setMetaTag("og:image", data.ogImage, true);
  if (data.canonical) setMetaTag("og:url", data.canonical, true);

  // Twitter Card tags
  setMetaTag("twitter:card", "summary_large_image");
  setMetaTag("twitter:title", data.title);
  setMetaTag("twitter:description", data.description);
  if (data.ogImage) setMetaTag("twitter:image", data.ogImage);

  // Article specific tags
  if (data.type === "article") {
    if (data.publishedTime) setMetaTag("article:published_time", data.publishedTime, true);
    if (data.modifiedTime) setMetaTag("article:modified_time", data.modifiedTime, true);
    if (data.author) setMetaTag("article:author", data.author, true);
  }

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (data.canonical) {
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = data.canonical;
  }
};

export const generateStructuredData = (type: "website" | "article" | "person", data: any) => {
  const baseUrl = window.location.origin;
  
  const structuredData: any = {
    "@context": "https://schema.org",
  };

  if (type === "website") {
    structuredData["@type"] = "WebSite";
    structuredData.name = data.name || "Lydia's Diaries";
    structuredData.description = data.description;
    structuredData.url = baseUrl;
  } else if (type === "article") {
    structuredData["@type"] = "Article";
    structuredData.headline = data.title;
    structuredData.description = data.description;
    structuredData.image = data.image;
    structuredData.datePublished = data.datePublished;
    structuredData.author = {
      "@type": "Person",
      name: data.author,
    };
  } else if (type === "person") {
    structuredData["@type"] = "Person";
    structuredData.name = data.name;
    structuredData.description = data.bio;
    structuredData.url = `${baseUrl}/author/${data.id}`;
  }

  // Create or update script tag
  let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(structuredData);
};