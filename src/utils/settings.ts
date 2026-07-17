export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  copyright: string;
  twitter: string;
  tiktok: string;
  instagram: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: "Lydia's Diaries",
  siteDescription: "A space where learning feels less like a lecture and more like a conversation over a cup of coffee. Explore stories about science, biotechnology, career advice, and lessons from my journey.",
  copyright: `© ${new Date().getFullYear()} Lydia's Diaries. All rights reserved.`,
  twitter: "https://x.com/nnennalydia?s=11&t=rQjxzJkTWMA51t1No54hrg",
  tiktok: "https://www.tiktok.com/@nnennalydia?_t=ZM-90tiAa1A3gJ&_r=1",
  instagram: "https://www.instagram.com/nnennaitodo?igsh=NmozcmhhMDhoY2J6&utm_source=qr",
};

const STORAGE_KEY = "lydia_diaries_site_settings";

export const getSiteSettings = (): SiteSettings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch (error) {
    console.error("Error loading site settings:", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSiteSettings = (settings: Partial<SiteSettings>): SiteSettings => {
  try {
    const current = getSiteSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Trigger custom event so other components can listen to changes
    window.dispatchEvent(new Event("site-settings-updated"));
    return updated;
  } catch (error) {
    console.error("Error saving site settings:", error);
    return getSiteSettings();
  }
};
