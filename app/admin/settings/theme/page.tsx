"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { LiveEditorLayout } from "@/components/admin/live-editor-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { GlobalThemeData, DEFAULT_THEME_DATA, ThemeModeSettings } from "@/components/global-theme-inject";
import { useTheme } from "next-themes";

export default function AdminThemePage() {
  const [savedData, setSavedData] = useState<GlobalThemeData | null>(null);
  const [draftData, setDraftData] = useState<GlobalThemeData>(DEFAULT_THEME_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMode, setEditingMode] = useState<"light" | "dark">("light");
  const { setTheme } = useTheme();

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const docRef = doc(db, "settings", "theme");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as GlobalThemeData;
          setSavedData(data);
          setDraftData(data);
        } else {
          setSavedData(DEFAULT_THEME_DATA);
          setDraftData(DEFAULT_THEME_DATA);
        }
      } catch (error: any) {
        console.error("Error fetching theme data:", error);
        toast.error(`Fetch Error: ${error.code || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();
  }, []);

  // Ensure the live preview reflects the mode we are currently editing
  useEffect(() => {
    setTheme(editingMode);
  }, [editingMode, setTheme]);

  const handleUpdate = (field: keyof ThemeModeSettings, value: string) => {
    setDraftData(prev => ({
      ...prev,
      [editingMode]: {
        ...prev[editingMode],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "settings", "theme");
      await setDoc(docRef, draftData);
      setSavedData(draftData);
      toast.success("Theme settings updated successfully!");
    } catch (error: any) {
      console.error("Error saving theme data:", error);
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

  const currentSettings = draftData[editingMode];

  // Dynamic style specifically for the preview panel to override global injects locally
  const previewStyle = {
    backgroundColor: currentSettings.backgroundColor,
    color: currentSettings.textColor,
    '--font-body': currentSettings.bodyFont,
    '--font-heading': currentSettings.headingFont,
  } as React.CSSProperties;

  const PreviewPanel = (
    <div className="preview-container h-full w-full relative p-8 overflow-y-auto transition-colors duration-500" style={previewStyle}>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: currentSettings.primaryColor }}>
            Global Theme Preview
          </h1>
          <p className="text-xl" style={{ fontFamily: 'var(--font-body)', color: currentSettings.secondaryColor }}>
            This is how your secondary text and body copy will look.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-opacity-20" style={{ borderColor: currentSettings.accentColor }}>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Accent Color</h3>
            <p className="opacity-80 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              This box border is using the accent color.
            </p>
            <div className="w-12 h-12 rounded-full" style={{ backgroundColor: currentSettings.accentColor }}></div>
          </div>

          <div className="p-6 rounded-lg bg-opacity-10" style={{ backgroundColor: currentSettings.primaryColor }}>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Primary Elements</h3>
            <p className="opacity-80 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              Box background uses primary color with low opacity.
            </p>
          </div>
        </div>

        <div>
          <button 
            className="px-8 py-4 font-bold rounded-md transition-colors"
            style={{ 
              backgroundColor: currentSettings.buttonColor, 
              color: currentSettings.backgroundColor,
              fontFamily: 'var(--font-body)'
            }}
          >
            Sample Button
          </button>
          <p className="text-sm mt-2 opacity-60" style={{ fontFamily: 'var(--font-body)' }}>
            (Hover color: <span style={{ color: currentSettings.buttonHoverColor }}>{currentSettings.buttonHoverColor}</span>)
          </p>
        </div>
      </div>
    </div>
  );

  const ControlsPanel = (
    <div className="space-y-6 w-full pb-20">
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Global Theme System</h3>
          <p className="text-sm text-muted-foreground">Manage CSS variables dynamically.</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className={editingMode === "light" ? "font-bold" : "opacity-60"}>Light Mode</Label>
          <Switch 
            checked={editingMode === "dark"}
            onCheckedChange={(c) => setEditingMode(c ? "dark" : "light")}
          />
          <Label className={editingMode === "dark" ? "font-bold" : "opacity-60"}>Dark Mode</Label>
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Typography Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headingFont">Heading Font (--font-heading)</Label>
            <Input 
              id="headingFont" 
              value={currentSettings.headingFont} 
              onChange={(e) => handleUpdate('headingFont', e.target.value)} 
              placeholder="var(--font-montserrat), 'Montserrat', sans-serif"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bodyFont">Body Font (--font-body)</Label>
            <Input 
              id="bodyFont" 
              value={currentSettings.bodyFont} 
              onChange={(e) => handleUpdate('bodyFont', e.target.value)} 
              placeholder="var(--font-geist), 'Geist', sans-serif"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Color Palette (Hex, RGB, or OKLCH)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background (--background)</Label>
              <div className="flex gap-3">
                <Input 
                  type="color" 
                  value={currentSettings.backgroundColor.startsWith('#') ? currentSettings.backgroundColor.slice(0, 7) : '#000000'} 
                  onChange={(e) => handleUpdate('backgroundColor', e.target.value)} 
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  id="backgroundColor" 
                  value={currentSettings.backgroundColor} 
                  onChange={(e) => handleUpdate('backgroundColor', e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="textColor">Foreground/Text (--foreground)</Label>
              <div className="flex gap-3">
                <Input 
                  type="color" 
                  value={currentSettings.textColor.startsWith('#') ? currentSettings.textColor.slice(0, 7) : '#ffffff'} 
                  onChange={(e) => handleUpdate('textColor', e.target.value)} 
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  id="textColor" 
                  value={currentSettings.textColor} 
                  onChange={(e) => handleUpdate('textColor', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color (--primary)</Label>
              <div className="flex gap-3">
                <Input 
                  type="color" 
                  value={currentSettings.primaryColor.startsWith('#') ? currentSettings.primaryColor.slice(0, 7) : '#000000'} 
                  onChange={(e) => handleUpdate('primaryColor', e.target.value)} 
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  id="primaryColor" 
                  value={currentSettings.primaryColor} 
                  onChange={(e) => handleUpdate('primaryColor', e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color (--secondary)</Label>
              <div className="flex gap-3">
                <Input 
                  type="color" 
                  value={currentSettings.secondaryColor.startsWith('#') ? currentSettings.secondaryColor.slice(0, 7) : '#000000'} 
                  onChange={(e) => handleUpdate('secondaryColor', e.target.value)} 
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  id="secondaryColor" 
                  value={currentSettings.secondaryColor} 
                  onChange={(e) => handleUpdate('secondaryColor', e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color (--accent)</Label>
              <div className="flex gap-3">
                <Input 
                  type="color" 
                  value={currentSettings.accentColor.startsWith('#') ? currentSettings.accentColor.slice(0, 7) : '#000000'} 
                  onChange={(e) => handleUpdate('accentColor', e.target.value)} 
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  id="accentColor" 
                  value={currentSettings.accentColor} 
                  onChange={(e) => handleUpdate('accentColor', e.target.value)} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Button Styling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buttonColor">Button Background</Label>
              <div className="flex gap-3">
                <Input 
                  type="color" 
                  value={currentSettings.buttonColor.startsWith('#') ? currentSettings.buttonColor.slice(0, 7) : '#000000'} 
                  onChange={(e) => handleUpdate('buttonColor', e.target.value)} 
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  id="buttonColor" 
                  value={currentSettings.buttonColor} 
                  onChange={(e) => handleUpdate('buttonColor', e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonHoverColor">Button Hover</Label>
              <div className="flex gap-3">
                <Input 
                  type="color" 
                  value={currentSettings.buttonHoverColor.startsWith('#') ? currentSettings.buttonHoverColor.slice(0, 7) : '#000000'} 
                  onChange={(e) => handleUpdate('buttonHoverColor', e.target.value)} 
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  id="buttonHoverColor" 
                  value={currentSettings.buttonHoverColor} 
                  onChange={(e) => handleUpdate('buttonHoverColor', e.target.value)} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <LiveEditorLayout
      title="Theme & Typography Settings"
      preview={PreviewPanel}
      controls={ControlsPanel}
      isSaving={isSaving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
