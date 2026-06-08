"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Shield } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 text-foreground">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.email}
            </p>
          </div>
          
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Legacy Hero CMS (Preserved as requested) */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/hero'}>
            <CardHeader>
              <CardTitle>Hero Section (Legacy)</CardTitle>
              <CardDescription>Manage homepage hero text and profile image.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Edit Hero</Button>
            </CardContent>
          </Card>

          {/* 1. Home */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/home'}>
            <CardHeader>
              <CardTitle>Home</CardTitle>
              <CardDescription>Manage general home page content.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Edit Section</Button>
            </CardContent>
          </Card>

          {/* 2. Me */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/me'}>
            <CardHeader>
              <CardTitle>Me</CardTitle>
              <CardDescription>Update your personal information and bio.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Edit Section</Button>
            </CardContent>
          </Card>

          {/* 3. Portfolio */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/portfolio'}>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Manage your projects and case studies.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Edit Section</Button>
            </CardContent>
          </Card>

          {/* 4. Services */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/services'}>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>Update the services and skills you offer.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Edit Section</Button>
            </CardContent>
          </Card>

          {/* 5. VFX Showreel */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/showreel'}>
            <CardHeader>
              <CardTitle>VFX Showreel</CardTitle>
              <CardDescription>Manage your video showreels and embeds.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Edit Section</Button>
            </CardContent>
          </Card>

          {/* 6. Get In Touch */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/contact'}>
            <CardHeader>
              <CardTitle>Get In Touch</CardTitle>
              <CardDescription>Manage contact form settings and email routing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Edit Section</Button>
            </CardContent>
          </Card>

          {/* 7. Social Media */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/social'}>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Update your social links and platform URLs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Edit Section</Button>
            </CardContent>
          </Card>

          {/* 8. Settings */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/settings'}>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage global website settings and meta tags.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Edit Section</Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
