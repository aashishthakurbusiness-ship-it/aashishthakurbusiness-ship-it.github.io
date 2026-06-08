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
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import Image from "next/image";

export interface Skill {
  id: string;
  name: string;
}

export interface AboutMeData {
  title: string;
  intro: string;
  biography: string;
  experience: string;
  profileImageUrl: string;
  skills: Skill[];
}

const DEFAULT_DATA: AboutMeData = {
  title: "AASHISH THAKUR",
  intro: "DIRECTOR & VFX ARTIST",
  biography: "Aashish Thakur is an aspiring innovator, developer, and design thinker passionate about building technology that solves real-world problems. Currently working on MediTrack+ and GlucoTrack+, focusing on AI-powered healthcare solutions, while also exploring web development, cloud technologies, and product design.",
  experience: "",
  profileImageUrl: "/images/profile.webp",
  skills: [
    { id: '1', name: 'After Effects' },
    { id: '2', name: 'Cinema 4D' },
    { id: '3', name: 'React' },
    { id: '4', name: 'Next.js' },
  ]
};

export default function AdminMePage() {
  const [savedData, setSavedData] = useState<AboutMeData | null>(null);
  const [draftData, setDraftData] = useState<AboutMeData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchMeData = async () => {
      try {
        const docRef = doc(db, "site_content", "about_me");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<AboutMeData>;
          const mergedData = { ...DEFAULT_DATA, ...data, skills: data.skills || DEFAULT_DATA.skills };
          setSavedData(mergedData);
          setDraftData(mergedData);
        } else {
          setSavedData(DEFAULT_DATA);
          setDraftData(DEFAULT_DATA);
        }
      } catch (error: any) {
        console.error("Error fetching about_me data:", error);
        toast.error(`Fetch Error: ${error.code || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDraftData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    const newSkill = { id: Date.now().toString(), name: 'New Skill' };
    setDraftData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const handleUpdateSkill = (id: string, name: string) => {
    setDraftData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, name } : s)
    }));
  };

  const handleDeleteSkill = (id: string) => {
    setDraftData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id)
    }));
  };

  const moveSkill = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === draftData.skills.length - 1) return;

    setDraftData(prev => {
      const newSkills = [...prev.skills];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newSkills[index], newSkills[targetIndex]] = [newSkills[targetIndex], newSkills[index]];
      return { ...prev, skills: newSkills };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "site_content", "about_me"), draftData);
      setSavedData(draftData);
      toast.success("Me section updated successfully!");
    } catch (error: any) {
      console.error("Error saving about_me data:", error);
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
    <div className="preview-container h-full w-full flex items-center justify-center bg-background text-foreground relative p-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="space-y-2 md:space-y-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
            {draftData.title || 'Section Title'}
          </h2>
          <p className="text-base sm:text-xl md:text-2xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>
            {draftData.intro || 'Introduction'}
          </p>
          <p className="text-xs md:text-base lg:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {draftData.biography || 'Biography...'}
          </p>
          {draftData.experience && (
            <p className="text-xs md:text-base lg:text-lg text-muted-foreground leading-relaxed font-semibold">
              {draftData.experience}
            </p>
          )}
        </div>
        
        {draftData.skills.length > 0 && (
          <div className="pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {draftData.skills.map(skill => (
                <span key={skill.id} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ControlsPanel = (
    <div className="space-y-6 w-full">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Section Title</Label>
            <Input id="title" name="title" value={draftData.title} onChange={handleInputChange} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="intro">Introduction</Label>
            <Input id="intro" name="intro" value={draftData.intro} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="biography">Biography</Label>
            <Textarea 
              id="biography" 
              name="biography" 
              value={draftData.biography} 
              onChange={handleInputChange} 
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience Summary (Optional)</Label>
            <Input id="experience" name="experience" value={draftData.experience} onChange={handleInputChange} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profileImageUrl">Profile Image URL</Label>
            <Input id="profileImageUrl" name="profileImageUrl" value={draftData.profileImageUrl} onChange={handleInputChange} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Skills</CardTitle>
          <Button onClick={handleAddSkill} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Skill
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {draftData.skills.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No skills added yet.</p>
          )}
          {draftData.skills.map((skill, index) => (
            <div key={skill.id} className="flex items-center gap-2 bg-muted/30 p-2 rounded-md border border-border">
              <div className="flex flex-col gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => moveSkill(index, 'up')}
                  disabled={index === 0}
                >
                  <GripVertical className="h-4 w-4 rotate-90" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => moveSkill(index, 'down')}
                  disabled={index === draftData.skills.length - 1}
                >
                  <GripVertical className="h-4 w-4 rotate-90" />
                </Button>
              </div>
              <Input 
                value={skill.name}
                onChange={(e) => handleUpdateSkill(skill.id, e.target.value)}
                className="flex-1 bg-background"
                placeholder="Skill name..."
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDeleteSkill(skill.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <LiveEditorLayout
      title="Me Section CMS"
      preview={PreviewPanel}
      controls={ControlsPanel}
      isSaving={isSaving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
