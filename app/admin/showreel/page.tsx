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

export interface ShowreelVideo {
  id: string;
  title: string;
  description: string;
  tags: string; // Comma separated
  thumbnailUrl: string;
  videoUrl: string;
  order: number;
  enabled: boolean;
  featured: boolean;
}

const DEFAULT_SHOWREELS: ShowreelVideo[] = [
  {
    id: "showreel-1",
    title: "Studio Signature Sequence",
    description: "Visual Effects & Motion Design",
    tags: "After Effects, VFX",
    thumbnailUrl: "/images/vfx-thumbnail.png",
    videoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VFX%20-%20Title-B0g7yQ6SdCb5QxXL7uDiv15fRt6ivl.mp4",
    order: 0,
    enabled: true,
    featured: true
  },
  {
    id: "showreel-2",
    title: "GAYAK - Title Sequence",
    description: "Film Title Design & Animation",
    tags: "Motion Graphics, Cinema 4D",
    thumbnailUrl: "/images/gayak-thumbnail.webp",
    videoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/new-SBns0FE4ozZLwbRCVRt68AHyxp2ESR.mp4",
    order: 1,
    enabled: true,
    featured: true
  }
];

export default function AdminShowreelPage() {
  const [savedData, setSavedData] = useState<ShowreelVideo[] | null>(null);
  const [draftData, setDraftData] = useState<ShowreelVideo[]>(DEFAULT_SHOWREELS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchShowreels = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "showreels"));
        const showreels: ShowreelVideo[] = [];
        querySnapshot.forEach((doc) => {
          showreels.push({ id: doc.id, ...doc.data() } as ShowreelVideo);
        });
        
        if (showreels.length > 0) {
          showreels.sort((a, b) => a.order - b.order);
          setSavedData(showreels);
          setDraftData(showreels);
        } else {
          setSavedData(DEFAULT_SHOWREELS);
          setDraftData(DEFAULT_SHOWREELS);
        }
      } catch (error: any) {
        console.error("Error fetching showreels:", error);
        toast.error(`Fetch Error: ${error.code || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowreels();
  }, []);

  const handleAddVideo = () => {
    const newVideo: ShowreelVideo = {
      id: `new-${Date.now()}`,
      title: 'New Video',
      description: '',
      tags: '',
      thumbnailUrl: '',
      videoUrl: '',
      order: draftData.length,
      enabled: true,
      featured: false
    };
    setDraftData(prev => [...prev, newVideo]);
  };

  const handleUpdateVideo = (id: string, field: keyof ShowreelVideo, value: any) => {
    setDraftData(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleDeleteVideo = (id: string) => {
    setDraftData(prev => prev.filter(v => v.id !== id));
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === draftData.length - 1) return;

    setDraftData(prev => {
      const newData = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newData[index], newData[targetIndex]] = [newData[targetIndex], newData[index]];
      
      return newData.map((v, i) => ({ ...v, order: i }));
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      
      if (savedData) {
        const draftIds = draftData.map(v => v.id);
        const removedVideos = savedData.filter(v => !draftIds.includes(v.id));
        removedVideos.forEach(v => {
          if (!v.id.startsWith('new-')) {
            const docRef = doc(db, "showreels", v.id);
            batch.delete(docRef);
          }
        });
      }

      draftData.forEach((video, index) => {
        const docId = video.id.startsWith('new-') ? doc(collection(db, "showreels")).id : video.id;
        const docRef = doc(db, "showreels", docId);
        
        const videoData = { ...video, id: docId, order: index };
        batch.set(docRef, videoData);
      });

      await batch.commit();
      
      const querySnapshot = await getDocs(collection(db, "showreels"));
      const updatedVideos: ShowreelVideo[] = [];
      querySnapshot.forEach((doc) => {
        updatedVideos.push({ id: doc.id, ...doc.data() } as ShowreelVideo);
      });
      updatedVideos.sort((a, b) => a.order - b.order);
      
      setSavedData(updatedVideos);
      setDraftData(updatedVideos);
      
      toast.success("Showreel updated successfully!");
    } catch (error: any) {
      console.error("Error saving showreels:", error);
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
    <div className="preview-container h-full w-full bg-black text-white relative p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto py-12">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
          VFX Showreel (Preview)
        </h2>
        <p className="text-gray-400 mb-12">
          Previewing enabled videos in the Showreel player format.
        </p>

        {draftData.filter(v => v.enabled).length === 0 && (
          <div className="text-center text-gray-500 py-12 italic">
            No enabled videos to display.
          </div>
        )}

        {draftData.filter(v => v.enabled).length > 0 && (
          <div className="relative w-full max-w-5xl mx-auto">
            {/* Main Video Player Area */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-2xl shadow-black/50 group bg-black border border-white/10">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                {draftData.filter(v => v.enabled)[0]?.thumbnailUrl ? (
                   <Image
                      src={draftData.filter(v => v.enabled)[0].thumbnailUrl}
                      alt="Thumbnail"
                      fill
                      className="object-cover opacity-50"
                   />
                ) : (
                  <span>[Video Player Placeholder]</span>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-20" />
            </div>
            
            <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{draftData.filter(v => v.enabled)[0]?.title}</h3>
                <p className="text-gray-400">{draftData.filter(v => v.enabled)[0]?.description}</p>
              </div>
              <div className="flex gap-3">
                {draftData.filter(v => v.enabled)[0]?.tags.split(',').map((tag, index) => tag.trim() && (
                  <span key={index} className="px-4 py-2 bg-white/10 text-white text-sm rounded-full">{tag.trim()}</span>
                ))}
              </div>
            </div>
            
            {/* Thumbnails */}
            <div className="mt-8 flex gap-4 justify-center flex-wrap">
              {draftData.filter(v => v.enabled).map((video, index) => (
                <div
                  key={video.id}
                  className={`relative overflow-hidden rounded-lg transition-all duration-300 ring-1 ring-white/20 opacity-80`}
                >
                  <div className="w-24 md:w-32 aspect-video bg-gray-800 relative">
                    {video.thumbnailUrl && (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="text-xs text-white mt-1 text-center truncate px-1 pb-1 max-w-[96px] md:max-w-[128px]">
                    {video.title || 'Untitled'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ControlsPanel = (
    <div className="space-y-6 w-full pb-20">
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm sticky top-0 z-10">
        <div>
          <h3 className="text-lg font-semibold">Showreel Videos</h3>
          <p className="text-sm text-muted-foreground">Manage your video showreel items.</p>
        </div>
        <Button onClick={handleAddVideo} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Video
        </Button>
      </div>

      <div className="space-y-4">
        {draftData.length === 0 && (
          <p className="text-sm text-muted-foreground italic px-4">No videos added yet.</p>
        )}
        {draftData.map((video, index) => (
          <Card key={video.id} className={`bg-card border-border shadow-sm transition-opacity ${!video.enabled ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div className="flex items-start gap-3 w-full">
                <div className="flex flex-col gap-1 mt-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => moveVideo(index, 'up')}
                    disabled={index === 0}
                  >
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => moveVideo(index, 'down')}
                    disabled={index === draftData.length - 1}
                  >
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </Button>
                </div>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg">{video.title || `Video ${index + 1}`}</CardTitle>
                  <div className="text-xs text-muted-foreground flex gap-3">
                    <span>Order: {index}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteVideo(video.id)}
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
                    checked={video.enabled} 
                    onCheckedChange={(checked) => handleUpdateVideo(video.id, 'enabled', checked)}
                    id={`enable-${video.id}`}
                  />
                  <Label htmlFor={`enable-${video.id}`} className="cursor-pointer">Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={video.featured} 
                    onCheckedChange={(checked) => handleUpdateVideo(video.id, 'featured', checked)}
                    id={`featured-${video.id}`}
                  />
                  <Label htmlFor={`featured-${video.id}`} className="cursor-pointer">Featured</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${video.id}`}>Title</Label>
                  <Input 
                    id={`title-${video.id}`} 
                    value={video.title} 
                    onChange={(e) => handleUpdateVideo(video.id, 'title', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`tags-${video.id}`}>Tags (comma separated)</Label>
                  <Input 
                    id={`tags-${video.id}`} 
                    value={video.tags} 
                    onChange={(e) => handleUpdateVideo(video.id, 'tags', e.target.value)} 
                    placeholder="e.g. VFX, Motion Design"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`desc-${video.id}`}>Description</Label>
                <Textarea 
                  id={`desc-${video.id}`} 
                  value={video.description} 
                  onChange={(e) => handleUpdateVideo(video.id, 'description', e.target.value)} 
                  rows={2}
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-border mt-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Media</h4>
                <div className="space-y-2">
                  <Label htmlFor={`thumb-${video.id}`}>Thumbnail Poster URL</Label>
                  <Input 
                    id={`thumb-${video.id}`} 
                    value={video.thumbnailUrl} 
                    onChange={(e) => handleUpdateVideo(video.id, 'thumbnailUrl', e.target.value)} 
                    placeholder="/images/vfx-thumbnail.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`video-${video.id}`}>Video URL (MP4)</Label>
                  <Input 
                    id={`video-${video.id}`} 
                    value={video.videoUrl} 
                    onChange={(e) => handleUpdateVideo(video.id, 'videoUrl', e.target.value)} 
                    placeholder="https://.../.mp4"
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
      title="VFX Showreel CMS"
      preview={PreviewPanel}
      controls={ControlsPanel}
      isSaving={isSaving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
