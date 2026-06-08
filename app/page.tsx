import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HomeClient } from "@/components/home-client";

export const revalidate = 60; // Edge Cache: 60 seconds

export async function generateMetadata() {
  try {
    const globalSnap = await getDoc(doc(db, "settings", "global"));
    if (globalSnap.exists()) {
      const data = globalSnap.data() as any;
      return {
        title: data.seoTitle || data.siteName || "Aashish Thakur Portfolio",
        description: data.seoDescription || data.siteDescription,
        openGraph: {
          title: data.ogTitle || data.seoTitle,
          description: data.ogDescription || data.seoDescription,
        }
      };
    }
  } catch (error) {
    console.error("Failed to fetch metadata:", error);
  }
  return { 
    title: 'Aashish Thakur Portfolio',
    description: 'Portfolio of Aashish Thakur'
  };
}

export default async function Page() {
  const initialData: any = {};

  try {
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

    if (globalSnap.exists()) {
      initialData.globalSettings = globalSnap.data();
    }

    if (contactSnap.exists()) {
      initialData.contactData = contactSnap.data();
    }

    if (!showreelsSnap.empty) {
      const showreels: any[] = [];
      showreelsSnap.forEach((d) => {
        showreels.push({ id: d.id, ...d.data() });
      });
      showreels.sort((a, b) => a.order - b.order);
      initialData.showreelData = showreels;
    }
    
    if (!projectsSnap.empty) {
      const projects: any[] = [];
      projectsSnap.forEach((d) => {
        projects.push({ id: d.id, ...d.data() });
      });
      projects.sort((a, b) => a.order - b.order);
      initialData.projectsData = projects;
    }

    if (servicesSnap.exists()) {
      initialData.servicesData = servicesSnap.data();
    }

    if (aboutMeSnap.exists()) {
      initialData.aboutMeData = aboutMeSnap.data();
    }

    if (heroSnap.exists()) {
      const data = heroSnap.data() as any;
      initialData.heroData = {
        name: data.name || 'Aashish Thakur',
        title: data.title || 'Director & VFX Artist',
        subtitle: data.subtitle || 'Innovator & Design Thinker',
        description: data.description || 'Building AI-powered healthcare solutions',
        ctaText: data.ctaText || "Let's create",
        profileImageUrl: data.profileImageUrl || '/images/profile.webp',
        styles: data.styles
      };
    }

    if (socialSnap.exists()) {
      initialData.socialData = socialSnap.data();
    }
  } catch (error) {
    console.error("Failed to fetch SSR data:", error);
  }

  return <HomeClient initialData={initialData} />;
}
