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
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface ServicesData {
  title: string;
  subtitle: string;
  services: ServiceItem[];
}

const DEFAULT_DATA: ServicesData = {
  title: "Services",
  subtitle: "",
  services: [
    {
      id: "1",
      title: "VFX & Video Editing",
      description: "Professional visual effects, compositing, color grading, and cinematic video editing for films, commercials, and digital content.",
      icon: "",
      enabled: true
    },
    {
      id: "2",
      title: "UI/UX Design",
      description: "Creating intuitive and visually stunning user interfaces with a focus on user experience and modern design principles.",
      icon: "",
      enabled: true
    },
    {
      id: "3",
      title: "Web Development",
      description: "Full-stack web development using modern technologies, building scalable and performant web applications.",
      icon: "",
      enabled: true
    },
    {
      id: "4",
      title: "Brand Identity",
      description: "Developing distinctive visual identities through logo design, color systems, and cohesive brand assets.",
      icon: "",
      enabled: true
    },
    {
      id: "5",
      title: "Consulting",
      description: "Technology and creative consulting to help guide your digital transformation and creative projects.",
      icon: "",
      enabled: true
    },
    {
      id: "6",
      title: "3D Animation",
      description: "High-quality 3D modeling, texturing, and animation for product visualization and entertainment.",
      icon: "",
      enabled: true
    }
  ]
};

export default function AdminServicesPage() {
  const [savedData, setSavedData] = useState<ServicesData | null>(null);
  const [draftData, setDraftData] = useState<ServicesData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const docRef = doc(db, "site_content", "services");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<ServicesData>;
          const mergedData = { ...DEFAULT_DATA, ...data, services: data.services || DEFAULT_DATA.services };
          setSavedData(mergedData);
          setDraftData(mergedData);
        } else {
          setSavedData(DEFAULT_DATA);
          setDraftData(DEFAULT_DATA);
        }
      } catch (error: any) {
        console.error("Error fetching services data:", error);
        toast.error(`Fetch Error: ${error.code || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServicesData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDraftData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddService = () => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      title: 'New Service',
      description: 'Service description goes here...',
      icon: '',
      enabled: true
    };
    setDraftData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const handleUpdateService = (id: string, field: keyof ServiceItem, value: any) => {
    setDraftData(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const handleDeleteService = (id: string) => {
    setDraftData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id)
    }));
  };

  const moveService = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === draftData.services.length - 1) return;

    setDraftData(prev => {
      const newServices = [...prev.services];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newServices[index], newServices[targetIndex]] = [newServices[targetIndex], newServices[index]];
      return { ...prev, services: newServices };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "site_content", "services"), draftData);
      setSavedData(draftData);
      toast.success("Services section updated successfully!");
    } catch (error: any) {
      console.error("Error saving services data:", error);
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
      <div className="w-full max-w-5xl mx-auto py-12">
        <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-center">
          {draftData.title || 'Services'}
        </h2>
        {draftData.subtitle && (
          <p className="text-center text-muted-foreground mb-12">{draftData.subtitle}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {draftData.services.filter(s => s.enabled).length === 0 && (
            <div className="col-span-full text-center text-muted-foreground italic">
              No services enabled.
            </div>
          )}
          {draftData.services
            .filter(service => service.enabled)
            .map((service, index) => (
              <div key={service.id} className="space-y-4 group">
                <div className="text-5xl font-bold text-gray-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {service.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                {service.icon && (
                  <p className="text-xs text-muted-foreground italic pt-2">Icon configured: {service.icon}</p>
                )}
              </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ControlsPanel = (
    <div className="space-y-6 w-full">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Section Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Section Title</Label>
            <Input id="title" name="title" value={draftData.title} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Section Subtitle (Optional)</Label>
            <Input id="subtitle" name="subtitle" value={draftData.subtitle} onChange={handleInputChange} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Services List</h3>
        <Button onClick={handleAddService} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      <div className="space-y-4">
        {draftData.services.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No services added yet.</p>
        )}
        {draftData.services.map((service, index) => (
          <Card key={service.id} className={`bg-card border-border shadow-sm transition-opacity ${!service.enabled ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => moveService(index, 'up')}
                    disabled={index === 0}
                  >
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => moveService(index, 'down')}
                    disabled={index === draftData.services.length - 1}
                  >
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </Button>
                </div>
                <CardTitle className="text-lg">Service {index + 1}</CardTitle>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={service.enabled} 
                    onCheckedChange={(checked) => handleUpdateService(service.id, 'enabled', checked)}
                    id={`enable-${service.id}`}
                  />
                  <Label htmlFor={`enable-${service.id}`} className="cursor-pointer">Enabled</Label>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteService(service.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`title-${service.id}`}>Title</Label>
                <Input 
                  id={`title-${service.id}`} 
                  value={service.title} 
                  onChange={(e) => handleUpdateService(service.id, 'title', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`desc-${service.id}`}>Description</Label>
                <Textarea 
                  id={`desc-${service.id}`} 
                  value={service.description} 
                  onChange={(e) => handleUpdateService(service.id, 'description', e.target.value)} 
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`icon-${service.id}`}>Icon Name (Optional)</Label>
                <Input 
                  id={`icon-${service.id}`} 
                  value={service.icon} 
                  onChange={(e) => handleUpdateService(service.id, 'icon', e.target.value)} 
                  placeholder="e.g. lucide-monitor"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <LiveEditorLayout
      title="Services CMS"
      preview={PreviewPanel}
      controls={ControlsPanel}
      isSaving={isSaving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
