"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HomeClient } from "@/components/home-client";

export function HomeDataLoader() {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data: any = {};
        
        const [
          heroSnap,
          socialSnap,
          aboutMeSnap,
          servicesSnap,
          contactSnap,
          globalSnap,
          projectsSnap,
          showreelsSnap
        ] = await Promise.all([
          getDoc(doc(db, "site_content", "hero")),
          getDoc(doc(db, "settings", "social_media")),
          getDoc(doc(db, "site_content", "about_me")),
          getDoc(doc(db, "site_content", "services")),
          getDoc(doc(db, "site_content", "contact")),
          getDoc(doc(db, "settings", "global")),
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "showreels"))
        ]);

        if (globalSnap.exists()) data.globalSettings = globalSnap.data();
        if (contactSnap.exists()) data.contactData = contactSnap.data();

        if (!showreelsSnap.empty) {
          const showreels: any[] = [];
          showreelsSnap.forEach((d) => {
            showreels.push({ id: d.id, ...d.data() });
          });
          showreels.sort((a, b) => a.order - b.order);
          data.showreelData = showreels;
        }
        
        if (!projectsSnap.empty) {
          const projects: any[] = [];
          projectsSnap.forEach((d) => {
            projects.push({ id: d.id, ...d.data() });
          });
          projects.sort((a, b) => a.order - b.order);
          data.projectsData = projects;
        }

        if (servicesSnap.exists()) data.servicesData = servicesSnap.data();
        if (aboutMeSnap.exists()) data.aboutMeData = aboutMeSnap.data();

        if (heroSnap.exists()) {
          const hData = heroSnap.data() as any;
          data.heroData = {
            name: hData.name || 'Aashish Thakur',
            title: hData.title || 'Director & VFX Artist',
            subtitle: hData.subtitle || 'Innovator & Design Thinker',
            description: hData.description || 'Building AI-powered healthcare solutions',
            ctaText: hData.ctaText || "Let's create",
            profileImageUrl: hData.profileImageUrl || '/images/profile.webp',
            styles: hData.styles
          };
        }

        if (socialSnap.exists()) data.socialData = socialSnap.data();

        setInitialData(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setInitialData({}); // Pass empty to use defaults if it fails
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
      </div>
    );
  }

  return <HomeClient initialData={initialData} />;
}
