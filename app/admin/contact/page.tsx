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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export interface ContactData {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  location: string;
  ctaText: string;
  availability: string;
  responseTime: string;
  enableForm: boolean;
  showEmail: boolean;
  showPhone: boolean;
}

const DEFAULT_CONTACT_DATA: ContactData = {
  title: 'Start Your Project',
  subtitle: "Let's collaborate and bring your ideas to life. Select your project details below.",
  email: 'aashishthakurbusiness@gmail.com',
  phone: '',
  location: '',
  ctaText: 'Send Proposal',
  availability: 'Available for freelance work',
  responseTime: 'within 24 hours',
  enableForm: true,
  showEmail: true,
  showPhone: false,
};

export default function AdminContactPage() {
  const [savedData, setSavedData] = useState<ContactData | null>(null);
  const [draftData, setDraftData] = useState<ContactData>(DEFAULT_CONTACT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const docRef = doc(db, "site_content", "contact");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as ContactData;
          setSavedData(data);
          setDraftData(data);
        } else {
          setSavedData(DEFAULT_CONTACT_DATA);
          setDraftData(DEFAULT_CONTACT_DATA);
        }
      } catch (error: any) {
        console.error("Error fetching contact data:", error);
        toast.error(`Fetch Error: ${error.code || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, []);

  const handleUpdate = (field: keyof ContactData, value: any) => {
    setDraftData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "site_content", "contact");
      await setDoc(docRef, draftData);
      setSavedData(draftData);
      toast.success("Contact section updated successfully!");
    } catch (error: any) {
      console.error("Error saving contact data:", error);
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
      <div className="max-w-5xl mx-auto py-12">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8">
          {draftData.title}
        </h2>
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl">
          {draftData.subtitle}
        </p>

        {draftData.enableForm && (
          <div className="space-y-10 border border-white/10 p-8 rounded-lg opacity-80 pointer-events-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm uppercase tracking-wider text-gray-400">Name</label>
                <div className="w-full border-b-2 border-gray-700 py-3 text-lg text-gray-500">Your name</div>
              </div>
              <div className="space-y-3">
                <label className="block text-sm uppercase tracking-wider text-gray-400">Email</label>
                <div className="w-full border-b-2 border-gray-700 py-3 text-lg text-gray-500">your@email.com</div>
              </div>
            </div>
            
            <div className="pt-8">
              <button className="group relative inline-flex items-center gap-4 text-xl font-bold bg-white text-black px-10 py-5 rounded-md">
                <span>{draftData.ctaText}</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-6">
            {draftData.showEmail && draftData.email && (
              <div className="space-y-1">
                <p className="text-gray-400 text-sm uppercase tracking-wider">Email</p>
                <p className="text-xl">{draftData.email}</p>
              </div>
            )}
            {draftData.showPhone && draftData.phone && (
              <div className="space-y-1">
                <p className="text-gray-400 text-sm uppercase tracking-wider">Phone</p>
                <p className="text-xl">{draftData.phone}</p>
              </div>
            )}
          </div>
          <div className="space-y-6">
            {draftData.location && (
              <div className="space-y-1">
                <p className="text-gray-400 text-sm uppercase tracking-wider">Location</p>
                <p className="text-xl">{draftData.location}</p>
              </div>
            )}
            {draftData.availability && (
              <div className="space-y-1">
                <p className="text-gray-400 text-sm uppercase tracking-wider">Status</p>
                <p className="text-xl text-emerald-400">{draftData.availability}</p>
              </div>
            )}
            {draftData.responseTime && (
              <div className="space-y-1">
                <p className="text-gray-400 text-sm uppercase tracking-wider">Response Time</p>
                <p className="text-xl">{draftData.responseTime}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ControlsPanel = (
    <div className="space-y-6 w-full pb-20">
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm sticky top-0 z-10">
        <h3 className="text-lg font-semibold">Contact Section</h3>
        <p className="text-sm text-muted-foreground">Manage your contact information and form settings.</p>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Section Title</Label>
            <Input 
              id="title" 
              value={draftData.title} 
              onChange={(e) => handleUpdate('title', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Section Subtitle</Label>
            <Textarea 
              id="subtitle" 
              value={draftData.subtitle} 
              onChange={(e) => handleUpdate('subtitle', e.target.value)} 
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctaText">Form CTA Button Text</Label>
            <Input 
              id="ctaText" 
              value={draftData.ctaText} 
              onChange={(e) => handleUpdate('ctaText', e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                value={draftData.email} 
                onChange={(e) => handleUpdate('email', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={draftData.phone} 
                onChange={(e) => handleUpdate('phone', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={draftData.location} 
                onChange={(e) => handleUpdate('location', e.target.value)} 
                placeholder="e.g. New York, NY"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="availability">Availability Status</Label>
              <Input 
                id="availability" 
                value={draftData.availability} 
                onChange={(e) => handleUpdate('availability', e.target.value)} 
                placeholder="e.g. Accepting new clients"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseTime">Expected Response Time</Label>
              <Input 
                id="responseTime" 
                value={draftData.responseTime} 
                onChange={(e) => handleUpdate('responseTime', e.target.value)} 
                placeholder="e.g. within 24 hours"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Contact Form</Label>
              <p className="text-sm text-muted-foreground">Show the project inquiry form.</p>
            </div>
            <Switch 
              checked={draftData.enableForm} 
              onCheckedChange={(checked) => handleUpdate('enableForm', checked)}
            />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="space-y-0.5">
              <Label>Show Email</Label>
              <p className="text-sm text-muted-foreground">Display email publicly in the footer.</p>
            </div>
            <Switch 
              checked={draftData.showEmail} 
              onCheckedChange={(checked) => handleUpdate('showEmail', checked)}
            />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="space-y-0.5">
              <Label>Show Phone</Label>
              <p className="text-sm text-muted-foreground">Display phone number publicly in the footer.</p>
            </div>
            <Switch 
              checked={draftData.showPhone} 
              onCheckedChange={(checked) => handleUpdate('showPhone', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <LiveEditorLayout
      title="Contact CMS"
      preview={PreviewPanel}
      controls={ControlsPanel}
      isSaving={isSaving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
