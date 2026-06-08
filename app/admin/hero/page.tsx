"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db, app } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface HeroData {
  name: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  profileImageUrl: string;
}

export default function HeroAdmin() {
  const [data, setData] = useState<HeroData>({
    name: "",
    title: "",
    subtitle: "",
    description: "",
    ctaText: "",
    profileImageUrl: "",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log("HeroAdmin component mounted");
    console.time('hero-load');
    
    const fetchHeroData = async () => {
      console.log("Firestore request start");
      console.timeLog('hero-load', "Fetching from Firestore");
      console.log("Firebase Project ID:", app.options.projectId);
      console.log("Document path:", "site_content/hero");
      try {
        console.log("Running user test query...");
        const test = await getDocs(collection(db, "site_content"));
        console.log("Test Query Result:", test);

        const docRef = doc(db, "site_content", "hero");
        const docSnap = await getDoc(docRef);
        console.timeLog('hero-load', "Firestore response received");

        console.log("Document exists status:", docSnap.exists());

        if (docSnap.exists()) {
          console.log("getDoc result:", docSnap.data());
          setData(docSnap.data() as HeroData);
          console.timeLog('hero-load', "State update complete (exists)");
        } else {
          console.log("getDoc result: Document does not exist, using defaults.");
          // Initialize with default values if not present
          const defaultData: HeroData = {
            name: "Aashish Thakur",
            title: "Director & VFX Artist",
            subtitle: "Innovator & Design Thinker",
            description: "Building AI-powered healthcare solutions",
            ctaText: "Let's create",
            profileImageUrl: "/images/profile.webp"
          };
          setData(defaultData);
          console.timeLog('hero-load', "State update complete (defaults)");
        }
      } catch (error: any) {
        console.timeLog('hero-load', "Firestore fetch threw an error");
        console.error("Error fetching hero data:", error);
        console.error("Full Firebase error object (getDoc):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        toast.error(`Fetch Error: ${error.code || error.message}`);
      } finally {
        console.timeLog('hero-load', "Finally block reached, setting isLoading to false");
        setIsLoading(false);
        console.timeEnd('hero-load');
      }
    };

    fetchHeroData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    console.log("Attempting to save data to site_content/hero:", data);

    try {
      // Save directly to Firestore
      await setDoc(doc(db, "site_content", "hero"), data);
      console.log("saveDoc result: Success");
      toast.success("Hero section updated successfully!");
    } catch (error: any) {
      console.error("Error saving hero data:", error);
      console.error("Full Firebase error object (setDoc):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      toast.error(`Save Error: ${error.code || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 text-foreground">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hero Content</h1>
            <p className="text-muted-foreground">Manage the homepage hero section.</p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
            <CardDescription>Update text and profile image URL for the main hero section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (Glitch Effect)</Label>
                  <Input id="name" name="name" value={data.name} onChange={handleInputChange} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={data.title} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input id="subtitle" name="subtitle" value={data.subtitle} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input id="ctaText" name="ctaText" value={data.ctaText} onChange={handleInputChange} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={data.description} 
                    onChange={handleInputChange} 
                    rows={4}
                  />
                </div>
              </div>

              {/* Image Preview & URL Area */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                  <Input 
                    id="profileImageUrl" 
                    name="profileImageUrl" 
                    value={data.profileImageUrl} 
                    onChange={handleInputChange} 
                    placeholder="https://example.com/image.jpg or /images/profile.webp"
                  />
                </div>
                
                <div className="mt-4">
                  <Label>Live Preview</Label>
                  <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 bg-muted/20">
                    {data.profileImageUrl ? (
                      <div className="relative w-full aspect-[3/4] max-w-sm rounded-md overflow-hidden bg-black/5">
                        <Image 
                          src={data.profileImageUrl} 
                          alt="Hero Preview" 
                          fill 
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-8 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mb-2" />
                        <span>No image URL provided</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
