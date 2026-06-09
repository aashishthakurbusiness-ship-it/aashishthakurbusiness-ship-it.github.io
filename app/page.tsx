import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HomeDataLoader } from "@/components/home-data-loader";

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

export default function Page() {
  return <HomeDataLoader />;
}
