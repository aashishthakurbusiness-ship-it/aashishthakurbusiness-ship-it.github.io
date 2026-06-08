"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TypographySettings {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  letterSpacing: string;
  lineHeight: string;
  textAlign: string;
  color: string;
  hoverColor: string;
}

interface TypographyEditorProps {
  title: string;
  settings: TypographySettings;
  onChange: (settings: TypographySettings) => void;
}

export function TypographyEditor({ title, settings, onChange }: TypographyEditorProps) {
  const handleChange = (field: keyof TypographySettings, value: string) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title} Typography</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Input 
              value={settings.fontFamily} 
              onChange={(e) => handleChange("fontFamily", e.target.value)} 
              placeholder="e.g. var(--font-montserrat), sans-serif" 
            />
          </div>
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Input 
              value={settings.fontSize} 
              onChange={(e) => handleChange("fontSize", e.target.value)} 
              placeholder="e.g. 2rem, 32px" 
            />
          </div>
          <div className="space-y-2">
            <Label>Font Weight</Label>
            <Select value={settings.fontWeight} onValueChange={(v) => handleChange("fontWeight", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select weight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (400)</SelectItem>
                <SelectItem value="medium">Medium (500)</SelectItem>
                <SelectItem value="semibold">Semibold (600)</SelectItem>
                <SelectItem value="bold">Bold (700)</SelectItem>
                <SelectItem value="extrabold">Extrabold (800)</SelectItem>
                <SelectItem value="inherit">Inherit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Letter Spacing</Label>
            <Input 
              value={settings.letterSpacing} 
              onChange={(e) => handleChange("letterSpacing", e.target.value)} 
              placeholder="e.g. 0.05em, normal" 
            />
          </div>
          <div className="space-y-2">
            <Label>Line Height</Label>
            <Input 
              value={settings.lineHeight} 
              onChange={(e) => handleChange("lineHeight", e.target.value)} 
              placeholder="e.g. 1.2, 1.5, normal" 
            />
          </div>
          <div className="space-y-2">
            <Label>Text Align</Label>
            <Select value={settings.textAlign} onValueChange={(v) => handleChange("textAlign", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="inherit">Inherit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={settings.color || "#ffffff"} 
                onChange={(e) => handleChange("color", e.target.value)} 
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                value={settings.color} 
                onChange={(e) => handleChange("color", e.target.value)} 
                placeholder="e.g. #ffffff, var(--foreground)" 
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hover Color</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={settings.hoverColor || "#ffffff"} 
                onChange={(e) => handleChange("hoverColor", e.target.value)} 
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                value={settings.hoverColor} 
                onChange={(e) => handleChange("hoverColor", e.target.value)} 
                placeholder="e.g. #cccccc" 
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
