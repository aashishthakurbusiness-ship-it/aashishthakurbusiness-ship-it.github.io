"use client";

import { useState, useRef, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { ADMIN_EMAILS } from "@/hooks/use-auth";
import { Eye, EyeOff, Lock, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Status states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // For iframe scaling
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      // Assume target iframe width is 1440px
      setScale(width / 1440);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);

      if (!ADMIN_EMAILS.includes(email)) {
        setError("Unauthorized access. This email is not an admin.");
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      // The AdminGuard will automatically redirect to /admin once logged in
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
        await signOut(auth); // Reject immediately
        setError("Unauthorized access. This Google account is not an admin.");
        return;
      }

      // The AdminGuard will automatically redirect
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed the popup, silently ignore and return to idle state
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const isAnyLoading = loading || googleLoading;

  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white selection:bg-gray-300 dark:selection:bg-gray-700 font-sans animate-in fade-in duration-700 transition-colors">
      
      {/* Left Column - Live Preview (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative p-8 items-center justify-center overflow-hidden border-r border-gray-200 dark:border-white/5">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-black/5 dark:bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative w-full aspect-[16/10] bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-2xl group transform transition-transform duration-700 hover:scale-[1.02]">
          
          {/* Top Browser Bar */}
          <div className="flex items-center gap-2 pb-4 border-b border-gray-200 dark:border-white/10 mb-4 opacity-70 dark:opacity-50">
            <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500/80" />
            <div className="ml-4 text-xs font-mono text-gray-500 dark:text-gray-400">aashishthakur7.com.np</div>
          </div>

          {/* Iframe wrapper for scaling */}
          <div ref={containerRef} className="relative w-full h-[calc(100%-2rem)] overflow-hidden rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-white/5">
            <div 
              className="absolute top-0 left-0 origin-top-left" 
              style={{ 
                width: '1440px', 
                height: '900px', 
                transform: `scale(${scale})` 
              }}
            >
              <iframe 
                src="/" 
                className="w-full h-full pointer-events-none" 
                tabIndex={-1} 
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        
        {/* Security Indicator */}
        <div className="absolute top-8 right-8 sm:right-16 lg:right-32">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-400">
            <Lock className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            Secured Admin Access
          </div>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400">Sign in to manage your portfolio content.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-lg animate-in fade-in duration-300">
              <span className="text-sm font-medium">{error}</span>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-gray-500 dark:text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@aashishthakur7.com.np" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isAnyLoading}
                  className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-white/30 focus-visible:border-gray-300 dark:focus-visible:border-white/30 h-12 transition-all duration-300 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-500 dark:text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors">Password</Label>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isAnyLoading}
                    className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-white/30 focus-visible:border-gray-300 dark:focus-visible:border-white/30 h-12 transition-all duration-300 pr-10 disabled:opacity-50"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isAnyLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isAnyLoading}
                className="rounded border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-gray-300 dark:focus:ring-white/30 focus:ring-offset-0 w-4 h-4 cursor-pointer disabled:opacity-50"
              />
              <Label htmlFor="remember" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                Remember Me
              </Label>
            </div>

            <Button 
              type="submit" 
              disabled={isAnyLoading}
              className="w-full h-12 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-semibold rounded-md transition-all duration-300 dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 dark:bg-[#0a0a0a] px-2 text-gray-400 dark:text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button 
              variant="outline" 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isAnyLoading}
              className="w-full h-12 bg-transparent border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white dark:hover:border-white/20 transition-all duration-300 disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            
            <Link 
              href="/"
              className={`w-full h-12 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 group ${isAnyLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Website
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
