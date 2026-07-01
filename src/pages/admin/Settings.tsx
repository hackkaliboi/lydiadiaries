import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getSiteSettings, saveSiteSettings, DEFAULT_SETTINGS, SiteSettings } from "@/utils/settings";
import { Save, RotateCcw, Globe, Share2, Info } from "lucide-react";

const Settings = () => {
    const { isAdmin, loading: adminLoading } = useAdmin();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            navigate("/");
            toast({
                variant: "destructive",
                title: "Access Denied",
                description: "You don't have permission to access this page.",
            });
        }
    }, [isAdmin, adminLoading, navigate, toast]);

    useEffect(() => {
        if (isAdmin) {
            setSettings(getSiteSettings());
        }
    }, [isAdmin]);

    const handleInputChange = (key: keyof SiteSettings, value: string) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            saveSiteSettings(settings);
            toast({
                title: "Settings Saved",
                description: "The site configuration has been successfully updated.",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "An error occurred while saving configuration.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleResetDefaults = () => {
        if (window.confirm("Are you sure you want to restore default settings? This will overwrite your current settings.")) {
            setSettings(DEFAULT_SETTINGS);
            saveSiteSettings(DEFAULT_SETTINGS);
            toast({
                title: "Defaults Restored",
                description: "Default settings have been restored and saved.",
            });
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
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Configure global site settings and social preferences</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* General Settings */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" />
                                General Settings
                            </CardTitle>
                            <CardDescription>
                                Identity and primary information for Lydia's Diaries
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="siteTitle">Site Title</Label>
                                <Input
                                    id="siteTitle"
                                    value={settings.siteTitle}
                                    onChange={(e) => handleInputChange("siteTitle", e.target.value)}
                                    placeholder="Lydia's Diaries"
                                    required
                                    className="bg-background border-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="siteDescription">Site Description</Label>
                                <Textarea
                                    id="siteDescription"
                                    rows={4}
                                    value={settings.siteDescription}
                                    onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                                    placeholder="Enter default meta and hero description..."
                                    required
                                    className="bg-background border-input resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="copyright">Copyright Footer Text</Label>
                                <Input
                                    id="copyright"
                                    value={settings.copyright}
                                    onChange={(e) => handleInputChange("copyright", e.target.value)}
                                    placeholder="© 2026 Lydia's Diaries. All rights reserved."
                                    required
                                    className="bg-background border-input"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Media Links */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Share2 className="h-5 w-5 text-primary" />
                                Social Media Settings
                            </CardTitle>
                            <CardDescription>
                                Customize social platform links appearing in the footer
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter / X URL</Label>
                                <Input
                                    id="twitter"
                                    type="url"
                                    value={settings.twitter}
                                    onChange={(e) => handleInputChange("twitter", e.target.value)}
                                    placeholder="https://x.com/..."
                                    className="bg-background border-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tiktok">TikTok URL</Label>
                                <Input
                                    id="tiktok"
                                    type="url"
                                    value={settings.tiktok}
                                    onChange={(e) => handleInputChange("tiktok", e.target.value)}
                                    placeholder="https://tiktok.com/..."
                                    className="bg-background border-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram URL</Label>
                                <Input
                                    id="instagram"
                                    type="url"
                                    value={settings.instagram}
                                    onChange={(e) => handleInputChange("instagram", e.target.value)}
                                    placeholder="https://instagram.com/..."
                                    className="bg-background border-input"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-muted/20 p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <span>Changes apply instantly across the site when saved.</span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleResetDefaults}
                                className="flex items-center gap-1.5 w-full sm:w-auto"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Restore Defaults
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-1.5 w-full sm:w-auto"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? "Saving..." : "Save Settings"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default Settings;