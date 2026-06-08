"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { LiveEditorLayout } from "@/components/admin/live-editor-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { TypographyEditor, TypographySettings } from "@/components/admin/typography-editor";
import { useTheme } from "next-themes";

export interface ThemeSettings {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export interface HeroStyles {
  typography: {
    name: TypographySettings;
    title: TypographySettings;
    subtitle: TypographySettings;
    description: TypographySettings;
    ctaText: TypographySettings;
  };
  theme: {
    light: ThemeSettings;
    dark: ThemeSettings;
  };
}

export interface HeroData {
  name: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  profileImageUrl: string;
  styles?: HeroStyles;
}

const DEFAULT_TYPOGRAPHY: TypographySettings = {
  fontFamily: "",
  fontSize: "",
  fontWeight: "inherit",
  letterSpacing: "",
  lineHeight: "",
  textAlign: "inherit",
  color: "",
  hoverColor: ""
};

const DEFAULT_STYLES: HeroStyles = {
  typography: {
    name: { ...DEFAULT_TYPOGRAPHY, fontFamily: "var(--font-montserrat)", fontWeight: "bold" },
    title: { ...DEFAULT_TYPOGRAPHY },
    subtitle: { ...DEFAULT_TYPOGRAPHY, fontWeight: "semibold" },
    description: { ...DEFAULT_TYPOGRAPHY },
    ctaText: { ...DEFAULT_TYPOGRAPHY, fontWeight: "bold" },
  },
  theme: {
    light: {
      backgroundColor: "",
      textColor: "",
      accentColor: ""
    },
    dark: {
      backgroundColor: "",
      textColor: "",
      accentColor: ""
    }
  }
};

const DEFAULT_DATA: HeroData = {
  name: "Aashish Thakur",
  title: "Director & VFX Artist",
  subtitle: "Innovator & Design Thinker",
  description: "Building AI-powered healthcare solutions",
  ctaText: "Let's create",
  profileImageUrl: "/images/profile.webp",
  styles: DEFAULT_STYLES
};

export default function AdminHomePage() {
  const [savedData, setSavedData] = useState<HeroData | null>(null);
  const [draftData, setDraftData] = useState<HeroData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Hack effect state for the preview
  const [hackText, setHackText] = useState("");
  const [isHacking, setIsHacking] = useState(false);
  
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const docRef = doc(db, "site_content", "hero");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as HeroData;
          
          // Merge with default styles to prevent missing nested keys
          const mergedData = {
            ...DEFAULT_DATA,
            ...data,
            styles: {
              typography: {
                ...DEFAULT_DATA.styles!.typography,
                ...(data.styles?.typography || {})
              },
              theme: {
                ...DEFAULT_DATA.styles!.theme,
                ...(data.styles?.theme || {})
              }
            }
          };
          
          setSavedData(mergedData);
          setDraftData(mergedData);
          setHackText(mergedData.name);
        } else {
          setSavedData(DEFAULT_DATA);
          setDraftData(DEFAULT_DATA);
          setHackText(DEFAULT_DATA.name);
        }
      } catch (error: any) {
        console.error("Error fetching hero data:", error);
        toast.error(`Fetch Error: ${error.code || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  useEffect(() => {
    if (!isHacking) {
      setHackText(draftData.name);
    }
  }, [draftData.name, isHacking]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDraftData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypographyChange = (key: keyof HeroStyles['typography'], settings: TypographySettings) => {
    setDraftData(prev => ({
      ...prev,
      styles: {
        ...prev.styles!,
        typography: {
          ...prev.styles!.typography,
          [key]: settings
        }
      }
    }));
  };

  const handleThemeChange = (mode: 'light' | 'dark', field: keyof ThemeSettings, value: string) => {
    setDraftData(prev => ({
      ...prev,
      styles: {
        ...prev.styles!,
        theme: {
          ...prev.styles!.theme,
          [mode]: {
            ...prev.styles!.theme[mode],
            [field]: value
          }
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "site_content", "hero"), draftData);
      setSavedData(draftData);
      toast.success("Home section updated successfully!");
    } catch (error: any) {
      console.error("Error saving hero data:", error);
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

  const startHackEffect = () => {
    if (isHacking) return;
    setIsHacking(true);
    
    const originalText = draftData.name;
    const chars = '01!@#$%^&*(){}[]<>?/\\|~`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let iterations = 0;
    
    const interval = setInterval(() => {
      setHackText(
        originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iterations) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      
      iterations += 0.15;
      
      if (iterations >= originalText.length) {
        clearInterval(interval);
        setHackText(originalText);
        setIsHacking(false);
      }
    }, 60);
  };

  const resetText = () => {
    if (!isHacking) setHackText(draftData.name);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentTheme = resolvedTheme === 'dark' ? draftData.styles?.theme.dark : draftData.styles?.theme.light;
  
  const generateDynamicStyles = () => {
    const typo = draftData.styles?.typography;
    if (!typo) return "";

    const generateCSS = (selector: string, settings: TypographySettings) => {
      let css = `${selector} {\n`;
      if (settings.fontFamily) css += `  font-family: ${settings.fontFamily};\n`;
      if (settings.fontSize) css += `  font-size: ${settings.fontSize};\n`;
      if (settings.fontWeight && settings.fontWeight !== 'inherit') css += `  font-weight: ${settings.fontWeight};\n`;
      if (settings.letterSpacing) css += `  letter-spacing: ${settings.letterSpacing};\n`;
      if (settings.lineHeight) css += `  line-height: ${settings.lineHeight};\n`;
      if (settings.textAlign && settings.textAlign !== 'inherit') css += `  text-align: ${settings.textAlign};\n`;
      if (settings.color) css += `  color: ${settings.color};\n`;
      css += `}\n`;
      
      if (settings.hoverColor) {
        css += `${selector}:hover {\n  color: ${settings.hoverColor};\n}\n`;
      }
      return css;
    };

    let css = "";
    css += generateCSS('.hero-name-preview', typo.name);
    css += generateCSS('.hero-title-preview', typo.title);
    css += generateCSS('.hero-subtitle-preview', typo.subtitle);
    css += generateCSS('.hero-description-preview', typo.description);
    css += generateCSS('.hero-cta-preview', typo.ctaText);
    
    // Theme colors
    if (currentTheme?.backgroundColor) {
      css += `.preview-container { background-color: ${currentTheme.backgroundColor} !important; }\n`;
    }
    if (currentTheme?.textColor) {
      css += `.preview-container { color: ${currentTheme.textColor} !important; }\n`;
    }

    return css;
  };

  const PreviewPanel = (
    <div className="preview-container h-full w-full overflow-hidden flex items-center justify-center bg-background text-foreground relative scale-[0.8] lg:scale-[0.9] origin-center transition-colors duration-300">
      <style>{generateDynamicStyles()}</style>
      <div className="grid lg:grid-cols-2 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-center p-6 relative">
          <div className="relative w-full max-w-sm aspect-[3/4] transition-all duration-300 hover:scale-105 group px-4">
            <Image
              src={draftData.profileImageUrl || '/images/profile.webp'}
              alt={draftData.name}
              fill
              className="object-cover transition-all duration-700 group-hover:grayscale rounded-md"
              priority
              unoptimized
            />
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 relative">
          <div className="flex-1 flex flex-col justify-center">
            <h1 
              className="hero-name-preview text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 lg:mb-6 cursor-pointer glitch-container"
              onMouseEnter={startHackEffect}
              onMouseLeave={resetText}
            >
              <span className="glitch-text" data-text={hackText}>{hackText}</span>
            </h1>
            
            <div className="space-y-2 mb-8">
              <p className="hero-title-preview text-lg lg:text-xl text-muted-foreground">{draftData.title}</p>
              <p className="hero-subtitle-preview text-base lg:text-lg text-muted-foreground font-semibold">{draftData.subtitle}</p>
              <p className="hero-description-preview text-base lg:text-lg text-muted-foreground">{draftData.description}</p>
            </div>

            <div className="space-y-4 group cursor-pointer text-left">
              <div className="flex items-center gap-4">
                <h2 className="hero-cta-preview text-2xl lg:text-3xl font-bold transition-transform duration-300 group-hover:scale-110 origin-left">
                  {draftData.ctaText}
                </h2>
                <svg 
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="hero-cta-preview transition-all duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
                >
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>
              <div 
                className="h-1 w-24 transition-all duration-500 ease-out group-hover:w-40"
                style={{ backgroundColor: draftData.styles?.theme[resolvedTheme === 'dark' ? 'dark' : 'light'].accentColor || 'currentColor' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ControlsPanel = (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="typography">Typography</TabsTrigger>
        <TabsTrigger value="theme">Theme Colors</TabsTrigger>
      </TabsList>
      
      <TabsContent value="content" className="space-y-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Main Name (Glitch Effect)</Label>
              <Input id="name" name="name" value={draftData.name} onChange={handleInputChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={draftData.title} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" name="subtitle" value={draftData.subtitle} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaText">Call to Action (CTA) Text</Label>
              <Input id="ctaText" name="ctaText" value={draftData.ctaText} onChange={handleInputChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={draftData.description} 
                onChange={handleInputChange} 
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileImageUrl">Profile Image URL</Label>
              <Input id="profileImageUrl" name="profileImageUrl" value={draftData.profileImageUrl} onChange={handleInputChange} placeholder="e.g. /images/profile.webp" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="typography" className="space-y-6">
        <TypographyEditor 
          title="Name" 
          settings={draftData.styles!.typography.name} 
          onChange={(s) => handleTypographyChange('name', s)} 
        />
        <TypographyEditor 
          title="Title" 
          settings={draftData.styles!.typography.title} 
          onChange={(s) => handleTypographyChange('title', s)} 
        />
        <TypographyEditor 
          title="Subtitle" 
          settings={draftData.styles!.typography.subtitle} 
          onChange={(s) => handleTypographyChange('subtitle', s)} 
        />
        <TypographyEditor 
          title="Description" 
          settings={draftData.styles!.typography.description} 
          onChange={(s) => handleTypographyChange('description', s)} 
        />
        <TypographyEditor 
          title="CTA Text" 
          settings={draftData.styles!.typography.ctaText} 
          onChange={(s) => handleTypographyChange('ctaText', s)} 
        />
      </TabsContent>

      <TabsContent value="theme" className="space-y-6">
        {/* LIGHT THEME */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>Light Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" value={draftData.styles!.theme.light.backgroundColor || "#ffffff"} onChange={(e) => handleThemeChange('light', 'backgroundColor', e.target.value)} />
                  <Input className="flex-1" placeholder="e.g. #ffffff" value={draftData.styles!.theme.light.backgroundColor} onChange={(e) => handleThemeChange('light', 'backgroundColor', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" value={draftData.styles!.theme.light.textColor || "#000000"} onChange={(e) => handleThemeChange('light', 'textColor', e.target.value)} />
                  <Input className="flex-1" placeholder="e.g. #000000" value={draftData.styles!.theme.light.textColor} onChange={(e) => handleThemeChange('light', 'textColor', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" value={draftData.styles!.theme.light.accentColor || "#000000"} onChange={(e) => handleThemeChange('light', 'accentColor', e.target.value)} />
                  <Input className="flex-1" placeholder="e.g. #000000" value={draftData.styles!.theme.light.accentColor} onChange={(e) => handleThemeChange('light', 'accentColor', e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DARK THEME */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>Dark Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" value={draftData.styles!.theme.dark.backgroundColor || "#000000"} onChange={(e) => handleThemeChange('dark', 'backgroundColor', e.target.value)} />
                  <Input className="flex-1" placeholder="e.g. #000000" value={draftData.styles!.theme.dark.backgroundColor} onChange={(e) => handleThemeChange('dark', 'backgroundColor', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" value={draftData.styles!.theme.dark.textColor || "#ffffff"} onChange={(e) => handleThemeChange('dark', 'textColor', e.target.value)} />
                  <Input className="flex-1" placeholder="e.g. #ffffff" value={draftData.styles!.theme.dark.textColor} onChange={(e) => handleThemeChange('dark', 'textColor', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" value={draftData.styles!.theme.dark.accentColor || "#ffffff"} onChange={(e) => handleThemeChange('dark', 'accentColor', e.target.value)} />
                  <Input className="flex-1" placeholder="e.g. #ffffff" value={draftData.styles!.theme.dark.accentColor} onChange={(e) => handleThemeChange('dark', 'accentColor', e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  return (
    <LiveEditorLayout
      title="Home Section"
      preview={PreviewPanel}
      controls={ControlsPanel}
      isSaving={isSaving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
