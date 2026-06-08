"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ThemeModeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  buttonColor: string;
  buttonHoverColor: string;
}

export interface GlobalThemeData {
  light: ThemeModeSettings;
  dark: ThemeModeSettings;
}

export const DEFAULT_THEME_DATA: GlobalThemeData = {
  light: {
    primaryColor: "#000000",
    secondaryColor: "#f4f4f5",
    accentColor: "#10b981",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    headingFont: "var(--font-montserrat), 'Montserrat', sans-serif",
    bodyFont: "var(--font-geist), 'Geist', sans-serif",
    buttonColor: "#000000",
    buttonHoverColor: "#e5e7eb",
  },
  dark: {
    primaryColor: "#ffffff",
    secondaryColor: "#27272a",
    accentColor: "#10b981",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    headingFont: "var(--font-montserrat), 'Montserrat', sans-serif",
    bodyFont: "var(--font-geist), 'Geist', sans-serif",
    buttonColor: "#ffffff",
    buttonHoverColor: "#e5e7eb",
  }
};

export function GlobalThemeInject() {
  const [themeData, setThemeData] = useState<GlobalThemeData | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "theme"));
        if (docSnap.exists()) {
          setThemeData(docSnap.data() as GlobalThemeData);
        }
      } catch (error) {
        console.error("Failed to load global theme:", error);
      }
    };
    fetchTheme();
  }, []);

  if (!themeData) return null;

  const css = `
    :root {
      --background: ${themeData.light.backgroundColor};
      --foreground: ${themeData.light.textColor};
      --primary: ${themeData.light.primaryColor};
      --secondary: ${themeData.light.secondaryColor};
      --accent: ${themeData.light.accentColor};
      --font-body: ${themeData.light.bodyFont};
      --font-heading: ${themeData.light.headingFont};
    }
    .dark {
      --background: ${themeData.dark.backgroundColor};
      --foreground: ${themeData.dark.textColor};
      --primary: ${themeData.dark.primaryColor};
      --secondary: ${themeData.dark.secondaryColor};
      --accent: ${themeData.dark.accentColor};
      --font-body: ${themeData.dark.bodyFont};
      --font-heading: ${themeData.dark.headingFont};
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: css }} />
  );
}
