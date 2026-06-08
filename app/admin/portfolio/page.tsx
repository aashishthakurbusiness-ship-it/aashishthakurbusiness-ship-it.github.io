"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { LiveEditorLayout } from "@/components/admin/live-editor-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import Image from "next/image";

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  tags: string;
  thumbnailUrl: string;
  videoUrl: string;
  projectUrl: string;
  client: string;
  status: string;
  order: number;
  enabled: boolean;
  featured: boolean;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "GAYAK Movie Poster - Cinematic VFX Design",
    subtitle: "Poster Design",
    description: "Visual effects and title design work.",
    category: "VFX",
    tags: "vfx, design",
    thumbnailUrl: "/images/poster-1.jpg",
    videoUrl: "",
    projectUrl: "",
    client: "",
    status: "Completed",
    order: 0,
    enabled: true,
    featured: true
  },
  {
    id: "proj-2",
    title: "GAYAK Movie Poster - Visual Effects Showcase",
    subtitle: "Poster Design",
    description: "Visual effects and title design work.",
    category: "VFX",
    tags: "vfx, design",
    thumbnailUrl: "/images/poster-2.jpg",
    videoUrl: "",
    projectUrl: "",
    client: "",
    status: "Completed",
    order: 1,
    enabled: true,
    featured: true
  },
  {
    id: "proj-3",
    title: "GAYAK Movie Poster - Sunset Composition",
    subtitle: "Poster Design",
    description: "Visual effects and title design work.",
    category: "VFX",
    tags: "vfx, design",
    thumbnailUrl: "/images/poster-3.jpg",
    videoUrl: "",
    projectUrl: "",
    client: "",
    status: "Completed",
    order: 2,
    enabled: true,
    featured: true
  },
  {
    id: "proj-4",
    title: "GAYAK Movie Poster - Ensemble Cast",
    subtitle: "Poster Design",
    description: "Visual effects and title design work.",
    category: "VFX",
    tags: "vfx, design",
    thumbnailUrl: "/images/poster-4.jpg",
    videoUrl: "",
    projectUrl: "",
    client: "",
    status: "Completed",
    order: 3,
    enabled: true,
    featured: true
  }
];

export default function AdminPortfolioPage() {
  const [savedData, setSavedData] = useState<Project[] | null>(null);
  const [draftData, setDraftData] = useState<Project[]>(DEFAULT_PROJECTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projects: Project[] = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() } as Project);
        });
        
        if (projects.length > 0) {
          projects.sort((a, b) => a.order - b.order);
          setSavedData(projects);
          setDraftData(projects);
        } else {
          setSavedData(DEFAULT_PROJECTS);
          setDraftData(DEFAULT_PROJECTS);
        }
      } catch (error: any) {
        console.error("Error fetching projects:", error);
        toast.error(`Fetch Error: ${error.code || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleAddProject = () => {
    const newProject: Project = {
      id: `new-${Date.now()}`,
      title: 'New Project',
      subtitle: '',
      description: '',
      category: '',
      tags: '',
      thumbnailUrl: '',
      videoUrl: '',
      projectUrl: '',
      client: '',
      status: 'Draft',
      order: draftData.length,
      enabled: true,
      featured: false
    };
    setDraftData(prev => [...prev, newProject]);
  };

  const handleUpdateProject = (id: string, field: keyof Project, value: any) => {
    setDraftData(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDeleteProject = (id: string) => {
    setDraftData(prev => prev.filter(p => p.id !== id));
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === draftData.length - 1) return;

    setDraftData(prev => {
      const newData = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newData[index], newData[targetIndex]] = [newData[targetIndex], newData[index]];
      
      // Update order field based on array position
      return newData.map((p, i) => ({ ...p, order: i }));
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      
      // If we have saved data, delete any docs that were removed in the draft
      if (savedData) {
        const draftIds = draftData.map(p => p.id);
        const removedProjects = savedData.filter(p => !draftIds.includes(p.id));
        removedProjects.forEach(p => {
          if (!p.id.startsWith('new-')) {
            const docRef = doc(db, "projects", p.id);
            batch.delete(docRef);
          }
        });
      }

      // Add/Update current drafts
      draftData.forEach((project, index) => {
        // Create a new ID for new projects, or use existing
        const docId = project.id.startsWith('new-') ? doc(collection(db, "projects")).id : project.id;
        const docRef = doc(db, "projects", docId);
        
        // Ensure order matches current array position
        const projectData = { ...project, id: docId, order: index };
        batch.set(docRef, projectData);
      });

      await batch.commit();
      
      // Re-fetch to get clean IDs
      const querySnapshot = await getDocs(collection(db, "projects"));
      const updatedProjects: Project[] = [];
      querySnapshot.forEach((doc) => {
        updatedProjects.push({ id: doc.id, ...doc.data() } as Project);
      });
      updatedProjects.sort((a, b) => a.order - b.order);
      
      setSavedData(updatedProjects);
      setDraftData(updatedProjects);
      
      toast.success("Portfolio projects updated successfully!");
    } catch (error: any) {
      console.error("Error saving projects:", error);
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
    <div className="preview-container h-full w-full bg-background text-foreground relative p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto py-12">
        <h2 className="text-4xl sm:text-5xl font-bold mb-12">
          Portfolio (Preview)
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {draftData.filter(p => p.enabled).length === 0 && (
            <div className="col-span-full text-muted-foreground italic text-center py-12">
              No enabled projects to display.
            </div>
          )}
          {draftData
            .filter(p => p.enabled)
            .sort((a, b) => a.order - b.order)
            .map((project, index) => (
              <div 
                key={project.id}
                className="group overflow-hidden relative aspect-[3/4] w-full rounded-lg bg-zinc-900 border border-zinc-800"
              >
                {project.thumbnailUrl ? (
                  <Image
                    src={project.thumbnailUrl}
                    alt={project.title}
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:grayscale"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-zinc-900 text-zinc-600 p-4 text-center text-sm">
                    No Thumbnail URL
                  </div>
                )}
                {/* Temporary overlay for preview purposes to show hidden data */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-white font-bold text-sm truncate">{project.title}</p>
                  <p className="text-gray-300 text-xs truncate">{project.subtitle || project.category}</p>
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ControlsPanel = (
    <div className="space-y-6 w-full pb-20">
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm sticky top-0 z-10">
        <div>
          <h3 className="text-lg font-semibold">Projects Collection</h3>
          <p className="text-sm text-muted-foreground">Manage your portfolio items.</p>
        </div>
        <Button onClick={handleAddProject} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      <div className="space-y-4">
        {draftData.length === 0 && (
          <p className="text-sm text-muted-foreground italic px-4">No projects added yet.</p>
        )}
        {draftData.map((project, index) => (
          <Card key={project.id} className={`bg-card border-border shadow-sm transition-opacity ${!project.enabled ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div className="flex items-start gap-3 w-full">
                <div className="flex flex-col gap-1 mt-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => moveProject(index, 'up')}
                    disabled={index === 0}
                  >
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => moveProject(index, 'down')}
                    disabled={index === draftData.length - 1}
                  >
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </Button>
                </div>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg">{project.title || `Project ${index + 1}`}</CardTitle>
                  <div className="text-xs text-muted-foreground flex gap-3">
                    <span>Order: {index}</span>
                    <span>Status: {project.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteProject(project.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex flex-wrap gap-6 bg-muted/20 p-4 rounded-md border border-border">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={project.enabled} 
                    onCheckedChange={(checked) => handleUpdateProject(project.id, 'enabled', checked)}
                    id={`enable-${project.id}`}
                  />
                  <Label htmlFor={`enable-${project.id}`} className="cursor-pointer">Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={project.featured} 
                    onCheckedChange={(checked) => handleUpdateProject(project.id, 'featured', checked)}
                    id={`featured-${project.id}`}
                  />
                  <Label htmlFor={`featured-${project.id}`} className="cursor-pointer">Featured</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${project.id}`}>Title</Label>
                  <Input 
                    id={`title-${project.id}`} 
                    value={project.title} 
                    onChange={(e) => handleUpdateProject(project.id, 'title', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`subtitle-${project.id}`}>Subtitle</Label>
                  <Input 
                    id={`subtitle-${project.id}`} 
                    value={project.subtitle} 
                    onChange={(e) => handleUpdateProject(project.id, 'subtitle', e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`desc-${project.id}`}>Description</Label>
                <Textarea 
                  id={`desc-${project.id}`} 
                  value={project.description} 
                  onChange={(e) => handleUpdateProject(project.id, 'description', e.target.value)} 
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cat-${project.id}`}>Category</Label>
                  <Input 
                    id={`cat-${project.id}`} 
                    value={project.category} 
                    onChange={(e) => handleUpdateProject(project.id, 'category', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`tags-${project.id}`}>Tags (comma separated)</Label>
                  <Input 
                    id={`tags-${project.id}`} 
                    value={project.tags} 
                    onChange={(e) => handleUpdateProject(project.id, 'tags', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`client-${project.id}`}>Client</Label>
                  <Input 
                    id={`client-${project.id}`} 
                    value={project.client} 
                    onChange={(e) => handleUpdateProject(project.id, 'client', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`status-${project.id}`}>Status</Label>
                  <Input 
                    id={`status-${project.id}`} 
                    value={project.status} 
                    onChange={(e) => handleUpdateProject(project.id, 'status', e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border mt-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Media & Links</h4>
                <div className="space-y-2">
                  <Label htmlFor={`thumb-${project.id}`}>Thumbnail URL</Label>
                  <Input 
                    id={`thumb-${project.id}`} 
                    value={project.thumbnailUrl} 
                    onChange={(e) => handleUpdateProject(project.id, 'thumbnailUrl', e.target.value)} 
                    placeholder="/images/poster-1.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`video-${project.id}`}>Video URL (Optional)</Label>
                  <Input 
                    id={`video-${project.id}`} 
                    value={project.videoUrl} 
                    onChange={(e) => handleUpdateProject(project.id, 'videoUrl', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`url-${project.id}`}>Project URL (Optional)</Label>
                  <Input 
                    id={`url-${project.id}`} 
                    value={project.projectUrl} 
                    onChange={(e) => handleUpdateProject(project.id, 'projectUrl', e.target.value)} 
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <LiveEditorLayout
      title="Portfolio CMS"
      preview={PreviewPanel}
      controls={ControlsPanel}
      isSaving={isSaving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
