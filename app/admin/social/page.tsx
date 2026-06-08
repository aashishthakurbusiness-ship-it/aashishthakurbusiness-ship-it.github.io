"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { LiveEditorLayout } from "@/components/admin/live-editor-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export interface SocialPlatform {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  openInNewTab: boolean;
}

export interface SocialMediaData {
  platforms: SocialPlatform[];
}

const DEFAULT_DATA: SocialMediaData = {
  platforms: [
    { id: 'email', name: 'Email', url: 'mailto:aashishthakurbusiness@gmail.com', enabled: true, openInNewTab: true },
    { id: 'github', name: 'GitHub', url: 'https://github.com/aashishthakurbusiness-ship-it', enabled: true, openInNewTab: true },
    { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/aashishthakurbusiness', enabled: true, openInNewTab: true },
    { id: 'instagram', name: 'Instagram', url: '', enabled: false, openInNewTab: true },
    { id: 'youtube', name: 'YouTube', url: '', enabled: false, openInNewTab: true },
    { id: 'twitter', name: 'X/Twitter', url: '', enabled: false, openInNewTab: true },
    { id: 'behance', name: 'Behance', url: '', enabled: false, openInNewTab: true },
    { id: 'artstation', name: 'ArtStation', url: '', enabled: false, openInNewTab: true },
  ]
};

export default function AdminSocialPage() {
  const [savedData, setSavedData] = useState<SocialMediaData | null>(null);
  const [draftData, setDraftData] = useState<SocialMediaData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        const docRef = doc(db, "settings", "social_media");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as SocialMediaData;
          
          // Merge to ensure all platforms exist even if previously missing
          const mergedPlatforms = DEFAULT_DATA.platforms.map(defaultPlatform => {
            const existing = data.platforms?.find(p => p.id === defaultPlatform.id);
            return existing ? { ...defaultPlatform, ...existing } : defaultPlatform;
          });
          
          const mergedData = { platforms: mergedPlatforms };
          setSavedData(mergedData);
          setDraftData(mergedData);
        } else {
          setSavedData(DEFAULT_DATA);
          setDraftData(DEFAULT_DATA);
        }
      } catch (error: any) {
        console.error("Error fetching social data:", error);
        toast.error(`Fetch Error: ${error.code || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialData();
  }, []);

  const handlePlatformChange = (id: string, field: keyof SocialPlatform, value: string | boolean) => {
    setDraftData(prev => ({
      platforms: prev.platforms.map(platform => 
        platform.id === id ? { ...platform, [field]: value } : platform
      )
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "social_media"), draftData);
      setSavedData(draftData);
      toast.success("Social media links updated successfully!");
    } catch (error: any) {
      console.error("Error saving social data:", error);
      toast.error(`Save Error: ${error.code || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (savedData) {
      setDraftData(savedData);
      toast.info("Restored to last saved state.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const PreviewPanel = (
    <div className="preview-container h-full w-full flex items-center justify-center bg-zinc-950 text-white relative">
      <div className="w-full max-w-2xl mx-auto p-8 border border-zinc-800 rounded-lg bg-zinc-900/50">
        <div className="space-y-4">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-6">Footer Preview: Follow</p>
          <div className="flex flex-wrap gap-6">
            {draftData.platforms.filter(p => p.enabled).length === 0 && (
              <span className="text-zinc-500 italic">No social platforms enabled.</span>
            )}
            {draftData.platforms
              .filter(platform => platform.enabled)
              .map(platform => (
                <Link 
                  key={platform.id}
                  href={platform.url || '#'} 
                  target={platform.openInNewTab ? "_blank" : undefined} 
                  rel={platform.openInNewTab ? "noopener noreferrer" : undefined}
                  className="text-xl hover:text-gray-400 transition-colors"
                >
                  {platform.name}
                </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ControlsPanel = (
    <div className="space-y-6 w-full">
      {draftData.platforms.map((platform) => (
        <Card key={platform.id} className={`bg-card border-border shadow-sm transition-opacity ${!platform.enabled ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{platform.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={platform.enabled} 
                onCheckedChange={(checked) => handlePlatformChange(platform.id, 'enabled', checked)}
                id={`enable-${platform.id}`}
              />
              <Label htmlFor={`enable-${platform.id}`} className="cursor-pointer">Enabled</Label>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`url-${platform.id}`}>URL</Label>
              <Input 
                id={`url-${platform.id}`} 
                value={platform.url} 
                onChange={(e) => handlePlatformChange(platform.id, 'url', e.target.value)} 
                placeholder={platform.id === 'email' ? 'mailto:your@email.com' : `https://${platform.id}.com/username`}
                disabled={!platform.enabled}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                checked={platform.openInNewTab} 
                onCheckedChange={(checked) => handlePlatformChange(platform.id, 'openInNewTab', checked)}
                id={`tab-${platform.id}`}
                disabled={!platform.enabled}
              />
              <Label htmlFor={`tab-${platform.id}`} className="text-sm text-muted-foreground cursor-pointer">Open in new tab</Label>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <LiveEditorLayout
      title="Social Media Manager"
      preview={PreviewPanel}
      controls={ControlsPanel}
      isSaving={isSaving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
