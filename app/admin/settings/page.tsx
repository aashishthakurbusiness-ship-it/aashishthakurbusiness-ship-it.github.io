"use client";

import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { LiveEditorLayout } from "@/components/admin/live-editor-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Download, Upload, AlertTriangle } from "lucide-react";

export interface GlobalSettingsData {
  siteName: string;
  siteDescription: string;
  siteEmail: string;
  siteLocation: string;
  copyrightText: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
}

const DEFAULT_SETTINGS: GlobalSettingsData = {
  siteName: 'Aashish Thakur Portfolio',
  siteDescription: 'Director & VFX Artist portfolio featuring cinematic visual effects, UI/UX design, and AI-powered healthcare solutions.',
  siteEmail: 'aashishthakurbusiness@gmail.com',
  siteLocation: 'Remote',
  copyrightText: '© 2026 Aashish Thakur. All rights reserved.',
  seoTitle: 'Aashish Thakur - Director & VFX Artist',
  seoDescription: 'Explore portfolio projects in VFX, UI/UX, and AI-powered healthcare.',
  ogTitle: 'Aashish Thakur - Director & VFX Artist',
  ogDescription: 'Portfolio of Aashish Thakur - Director & VFX Artist. Explore cinematic visual effects and design.',
};

export default function AdminSettingsPage() {
  const [savedData, setSavedData] = useState<GlobalSettingsData | null>(null);
  const [draftData, setDraftData] = useState<GlobalSettingsData>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "global");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as GlobalSettingsData;
          setSavedData(data);
          setDraftData(data);
        } else {
          setSavedData(DEFAULT_SETTINGS);
          setDraftData(DEFAULT_SETTINGS);
        }
      } catch (error: any) {
        console.error("Error fetching settings data:", error);
        toast.error(`Fetch Error: ${error.code || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdate = (field: keyof GlobalSettingsData, value: string) => {
    setDraftData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "settings", "global");
      await setDoc(docRef, draftData);
      setSavedData(draftData);
      toast.success("Global settings updated successfully!");
    } catch (error: any) {
      console.error("Error saving settings data:", error);
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

  const exportCMSData = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Gathering CMS data...");
    
    try {
      const backupData: any = {
        timestamp: new Date().toISOString(),
        site_content: {},
        settings: {},
        projects: [],
        showreels: []
      };

      // Fetch site_content
      const contentDocs = ["hero", "about_me", "services", "contact"];
      for (const docId of contentDocs) {
        const snap = await getDoc(doc(db, "site_content", docId));
        if (snap.exists()) backupData.site_content[docId] = snap.data();
      }

      // Fetch settings
      const settingsDocs = ["social_media", "theme", "global"];
      for (const docId of settingsDocs) {
        const snap = await getDoc(doc(db, "settings", docId));
        if (snap.exists()) backupData.settings[docId] = snap.data();
      }

      // Fetch collections
      const projectsSnap = await getDocs(collection(db, "projects"));
      projectsSnap.forEach(doc => backupData.projects.push({ id: doc.id, ...doc.data() }));

      const showreelsSnap = await getDocs(collection(db, "showreels"));
      showreelsSnap.forEach(doc => backupData.showreels.push({ id: doc.id, ...doc.data() }));

      // Create blob and download
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Backup downloaded successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Export Error:", error);
      toast.error(`Export failed: ${error.message}`, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonText = event.target?.result as string;
        const backupData = JSON.parse(jsonText);

        // Basic validation
        if (!backupData.site_content || !backupData.settings) {
          throw new Error("Invalid backup file structure.");
        }

        if (!confirm("⚠️ WARNING: This will overwrite your live Firestore database with the backup data. This action CANNOT be undone. Are you absolutely sure?")) {
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        await restoreCMSData(backupData);
      } catch (error: any) {
        toast.error(`Invalid JSON file: ${error.message}`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const restoreCMSData = async (backupData: any) => {
    setIsImporting(true);
    const toastId = toast.loading("Restoring database from backup...");

    try {
      // 1. Restore site_content
      if (backupData.site_content) {
        for (const [docId, data] of Object.entries(backupData.site_content)) {
          await setDoc(doc(db, "site_content", docId), data);
        }
      }

      // 2. Restore settings
      if (backupData.settings) {
        for (const [docId, data] of Object.entries(backupData.settings)) {
          await setDoc(doc(db, "settings", docId), data);
        }
      }

      // 3. Restore projects (Batch)
      if (backupData.projects && Array.isArray(backupData.projects)) {
        const batch = writeBatch(db);
        backupData.projects.forEach((proj: any) => {
          const { id, ...data } = proj;
          if (id) {
            batch.set(doc(db, "projects", id), data);
          }
        });
        await batch.commit();
      }

      // 4. Restore showreels (Batch)
      if (backupData.showreels && Array.isArray(backupData.showreels)) {
        const batch = writeBatch(db);
        backupData.showreels.forEach((vid: any) => {
          const { id, ...data } = vid;
          if (id) {
            batch.set(doc(db, "showreels", id), data);
          }
        });
        await batch.commit();
      }

      toast.success("Database restored successfully! Refresh the page to see changes.", { id: toastId });
    } catch (error: any) {
      console.error("Import Error:", error);
      toast.error(`Restore failed: ${error.message}`, { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getSeoStatus = (length: number, min: number, max: number) => {
    if (length === 0) return { label: "Missing", color: "text-red-500" };
    if (length < min) return { label: "Too Short", color: "text-amber-500" };
    if (length > max) return { label: "Too Long", color: "text-red-500" };
    return { label: "Good", color: "text-emerald-500" };
  };

  const titleStatus = getSeoStatus(draftData.seoTitle.length, 30, 60);
  const descStatus = getSeoStatus(draftData.seoDescription.length, 120, 160);

  const PreviewPanel = (
    <div className="preview-container h-full w-full bg-[#202124] text-[#bdc1c6] p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto py-12 space-y-16">
        
        {/* Mock Google Search Result */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">Search Engine Preview</h2>
          <div className="bg-[#171717] p-6 rounded-lg shadow-lg border border-gray-800 font-sans relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">AT</div>
              <div>
                <div className="text-sm text-gray-300">{draftData.siteName || "Aashish Thakur"}</div>
                <div className="text-xs text-gray-500">https://aashishthakur7.com.np</div>
              </div>
            </div>
            <div className="text-[#8ab4f8] text-xl cursor-pointer hover:underline mb-1 line-clamp-1">
              {draftData.seoTitle || "Missing Title"}
            </div>
            <div className="text-sm text-[#bdc1c6] leading-relaxed line-clamp-2">
              {draftData.seoDescription || "Missing meta description..."}
            </div>
            
            {/* SEO Indicators */}
            <div className="mt-6 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-500">Title: </span>
                <span className={draftData.seoTitle.length > 60 ? "text-red-400" : "text-white"}>{draftData.seoTitle.length} chars</span>
                <span className="text-gray-600"> (30-60) </span>
                <span className={`font-semibold ${titleStatus.color}`}>• {titleStatus.label}</span>
              </div>
              <div>
                <span className="text-gray-500">Desc: </span>
                <span className={draftData.seoDescription.length > 160 ? "text-red-400" : "text-white"}>{draftData.seoDescription.length} chars</span>
                <span className="text-gray-600"> (120-160) </span>
                <span className={`font-semibold ${descStatus.color}`}>• {descStatus.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Social Sharing Card (OG) */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">Social Sharing Preview (Twitter/LinkedIn)</h2>
          <div className="bg-[#171717] rounded-lg shadow-lg border border-gray-800 font-sans overflow-hidden max-w-sm">
            <div className="h-48 bg-zinc-800 flex items-center justify-center text-gray-500">
              [ OpenGraph Image ]
            </div>
            <div className="p-4 border-t border-gray-800 bg-[#222222]">
              <div className="text-[#8ab4f8] text-sm uppercase tracking-wider mb-1 font-semibold">aashishthakur7.com.np</div>
              <div className="text-white font-bold mb-1 line-clamp-1">{draftData.ogTitle}</div>
              <div className="text-gray-400 text-sm line-clamp-2">{draftData.ogDescription}</div>
            </div>
          </div>
        </div>

        {/* Footer Text Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">Footer Copyright Preview</h2>
          <div className="bg-black p-6 rounded-lg border border-gray-800 text-center">
            <p className="text-gray-500">{draftData.copyrightText}</p>
          </div>
        </div>

      </div>
    </div>
  );

  const ControlsPanel = (
    <div className="space-y-6 w-full pb-20">
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm sticky top-0 z-10">
        <h3 className="text-lg font-semibold">Settings & Backup</h3>
        <p className="text-sm text-muted-foreground">Manage global metadata and CMS recovery.</p>
      </div>

      {/* Backup & Recovery */}
      <Card className="bg-card border-border shadow-sm border-emerald-500/30">
        <CardHeader className="bg-emerald-500/5 rounded-t-lg">
          <div className="flex items-center gap-2 text-emerald-500">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Backup & Recovery</CardTitle>
          </div>
          <CardDescription>Export your entire CMS database or restore from a previous backup.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={exportCMSData}
              disabled={isExporting || isImporting}
              className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 p-4 rounded-md transition-colors disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              Export Backup (.json)
            </button>
            
            <div className="relative">
              <input 
                type="file" 
                accept=".json" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                onChange={handleFileUpload}
                ref={fileInputRef}
                disabled={isExporting || isImporting}
              />
              <div className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 p-4 rounded-md transition-colors h-full">
                {isImporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                Import Backup
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * Note: Importing a backup will overwrite existing documents with matching IDs in your live Firestore database.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Site Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input 
              id="siteName" 
              value={draftData.siteName} 
              onChange={(e) => handleUpdate('siteName', e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteEmail">Site Primary Email</Label>
              <Input 
                id="siteEmail" 
                type="email"
                value={draftData.siteEmail} 
                onChange={(e) => handleUpdate('siteEmail', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteLocation">Site Location</Label>
              <Input 
                id="siteLocation" 
                value={draftData.siteLocation} 
                onChange={(e) => handleUpdate('siteLocation', e.target.value)} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="copyrightText">Copyright Text (Footer)</Label>
            <Input 
              id="copyrightText" 
              value={draftData.copyrightText} 
              onChange={(e) => handleUpdate('copyrightText', e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>SEO Metadata</CardTitle>
          <CardDescription className="text-amber-500 flex items-center gap-2 mt-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            SEO changes require a rebuild/redeploy to update metadata tags.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">Meta Title</Label>
            <Input 
              id="seoTitle" 
              value={draftData.seoTitle} 
              onChange={(e) => handleUpdate('seoTitle', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoDescription">Meta Description</Label>
            <Textarea 
              id="seoDescription" 
              value={draftData.seoDescription} 
              onChange={(e) => handleUpdate('seoDescription', e.target.value)} 
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Social Sharing (OpenGraph)</CardTitle>
          <CardDescription>Controls how your site appears when linked on Twitter, LinkedIn, etc.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ogTitle">OpenGraph Title</Label>
            <Input 
              id="ogTitle" 
              value={draftData.ogTitle} 
              onChange={(e) => handleUpdate('ogTitle', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ogDescription">OpenGraph Description</Label>
            <Textarea 
              id="ogDescription" 
              value={draftData.ogDescription} 
              onChange={(e) => handleUpdate('ogDescription', e.target.value)} 
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );

  return (
    <LiveEditorLayout
      title="Global Settings"
      preview={PreviewPanel}
      controls={ControlsPanel}
      isSaving={isSaving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
