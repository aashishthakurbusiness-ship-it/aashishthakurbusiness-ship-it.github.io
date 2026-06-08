import { Loader2, Save, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";

interface LiveEditorLayoutProps {
  title: string;
  preview: ReactNode;
  controls: ReactNode;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  backHref?: string;
}

export function LiveEditorLayout({
  title,
  preview,
  controls,
  isSaving,
  onSave,
  onCancel,
  backHref = "/admin",
}: LiveEditorLayoutProps) {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-screen bg-background text-foreground overflow-hidden">
      
      {/* PREVIEW PANEL (Left on Desktop, Top on Mobile) */}
      <div className="relative border-b lg:border-b-0 lg:border-r border-border h-[50vh] lg:h-screen overflow-y-auto bg-background">
        
        {/* Floating Editor Badge */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-full text-xs font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live Preview
        </div>

        {/* Live Preview Content */}
        <div className="w-full h-full pointer-events-none select-none">
          {preview}
        </div>
      </div>

      {/* CONTROLS PANEL (Right on Desktop, Bottom on Mobile) */}
      <div className="flex flex-col h-[50vh] lg:h-screen bg-muted/5 dark:bg-muted/10">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between p-4 md:p-6 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href={backHref}>
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
              <X className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Cancel</span>
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving} className="min-w-[80px]">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 md:mr-2" />}
              <span className="hidden md:inline">{isSaving ? 'Saving' : 'Save'}</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-xl mx-auto space-y-8 pb-12">
            {controls}
          </div>
        </div>
      </div>
      
    </div>
  );
}
