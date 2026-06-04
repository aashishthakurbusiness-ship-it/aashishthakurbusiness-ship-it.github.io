'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Menu, X } from 'lucide-react'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [hackText, setHackText] = useState('Aashish Thakur')
  const [isHacking, setIsHacking] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    projectType: '',
    budget: '',
    botcheck: ''
  })
  const [submitError, setSubmitError] = useState('')
  const [activeVideo, setActiveVideo] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [heroHeight, setHeroHeight] = useState(800)

  const videos = [
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VFX%20-%20Title-B0g7yQ6SdCb5QxXL7uDiv15fRt6ivl.mp4",
      poster: "/images/poster-1.jpg",
      title: "Studio Signature Sequence",
      description: "Visual Effects & Motion Design",
      tags: ["After Effects", "VFX"]
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/new-SBns0FE4ozZLwbRCVRt68AHyxp2ESR.mp4",
      poster: "/images/gayak-thumbnail.webp",
      title: "GAYAK - Title Sequence",
      description: "Film Title Design & Animation",
      tags: ["Motion Graphics", "Cinema 4D"]
    }
  ]
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isOverDarkSection, setIsOverDarkSection] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    startHackEffect()
    setMounted(true)
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      setHeroHeight(window.innerHeight)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setShowScrollTop(window.scrollY > 500)

      const videoShowcase = document.getElementById('video-showcase')
      const contact = document.getElementById('contact')
      
      const checkOverlap = (el: HTMLElement | null) => {
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return rect.top <= 100 && rect.bottom >= 30
      }

      setIsOverDarkSection(checkOverlap(videoShowcase) || checkOverlap(contact))
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const startHackEffect = () => {
    if (isHacking) return
    setIsHacking(true)
    
    const originalText = 'Aashish Thakur'
    const chars = '01!@#$%^&*(){}[]<>?/\\|~`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let iterations = 0
    
    const interval = setInterval(() => {
      setHackText(
        originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < iterations) {
              return originalText[index]
            }
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')
      )
      
      iterations += 0.15
      
      if (iterations >= originalText.length) {
        clearInterval(interval)
        setHackText(originalText)
        setIsHacking(false)
      }
    }, 60)
  }

  const resetText = () => {
    if (!isHacking) {
      setHackText('Aashish Thakur')
    }
  }

  const scrollProgress = mounted ? Math.min(scrollY / heroHeight, 1) : 0
  
  const imageScale = mounted && !isMobile ? Math.max(0.65, 1 - (scrollProgress * 0.35)) : 1
  
  const imageTranslateY = 0
  const imageTranslateX = mounted && isMobile ? (-scrollProgress * 30) : 0
  
  const aboutMeProgress = mounted && !isMobile 
    ? Math.max(0, Math.min(1, (scrollY - heroHeight * 0.5) / (heroHeight * 0.3))) 
    : 1
  
  const navOpacity = scrollY > 100 ? 0.75 : 1

  const isDark = mounted && (resolvedTheme === 'dark' || isOverDarkSection)
  const navTextColor = isDark ? 'text-white' : 'text-foreground'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const selectProjectType = (type: string) => {
    setFormData(prev => ({ ...prev, projectType: type }))
  }

  const selectBudget = (budget: string) => {
    setFormData(prev => ({ ...prev, budget: budget }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    // Client-side quick checks
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitError('Please fill out all required fields.')
      setIsSubmitting(false)
      return
    }

    if (!formData.projectType) {
      setSubmitError('Please select a project type.')
      setIsSubmitting(false)
      return
    }

    if (!formData.budget) {
      setSubmitError('Please select an estimated budget range.')
      setIsSubmitting(false)
      return
    }

    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || 'ca1b4399-6a58-4070-a57a-efd55de2e611'
      
      const payload = {
        access_key: accessKey,
        name: formData.name,
        email: formData.email,
        projectType: formData.projectType,
        budget: formData.budget,
        message: formData.message,
        botcheck: formData.botcheck,
        subject: `New Project Proposal from ${formData.name} (${formData.projectType})`,
        from_name: 'Aashish Thakur Portfolio'
      }

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit proposal.')
      }

      setSubmitSuccess(true)
    } catch (error: any) {
      console.error('Submission error:', error)
      setSubmitError(error.message || 'Failed to send inquiry. Please check your connection or try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      message: '',
      projectType: '',
      budget: '',
      botcheck: ''
    })
    setSubmitSuccess(false)
    setSubmitError('')
  }
  
  const heroContentOpacity = Math.max(0, 1 - (scrollProgress * 2))

  const handleNavClick = (e: React.MouseEvent<any>, sectionId: string) => {
    e.preventDefault()
    const element = document.querySelector(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999] bg-black dark:bg-white text-white dark:text-black p-3 md:p-4 rounded-full shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-5 h-5 md:w-6 md:h-6"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>

      {/* Hero Section with sticky container */}
      <div id="home" className="relative" style={{ height: (mounted && isMobile) ? 'auto' : '150vh' }}>
        <div className={(mounted && isMobile) ? "relative" : "sticky top-0 h-screen overflow-hidden"}>
          <div className="grid lg:grid-cols-2 h-full">
            <div className="flex items-center justify-center p-6 md:p-8 lg:p-16 relative">
              <div 
                className="relative w-full max-w-lg aspect-[3/4] transition-all duration-300 ease-out hover:scale-105 group px-4"
                style={{
                  transform: `scale(${imageScale}) translateX(${imageTranslateX}%)`,
                  transformOrigin: 'center center',
                }}
              >
                <Image
                  src="/images/profile.webp"
                  alt="Aashish Thakur"
                  fill
                  className="object-cover transition-all duration-700 group-hover:grayscale"
                  priority
                />
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 md:p-8 lg:p-16 relative">
              {/* Mobile Hamburger Button */}
              {mounted && (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="fixed top-4 right-4 z-[10000] lg:hidden flex items-center justify-center w-10 h-10 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md text-foreground shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                  aria-label="Toggle menu"
                  aria-expanded={isMenuOpen}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}

              {/* Mobile Navigation Drawer */}
              {mounted && (
                <div
                  className={`fixed inset-0 z-[9998] bg-background/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 transition-all duration-500 lg:hidden ${
                    isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
                  }`}
                >
                  <nav className="flex flex-col items-center gap-6">
                    <Link 
                      href="#home" 
                      onClick={(e) => { handleNavClick(e, '#home'); setIsMenuOpen(false); }}
                      className="text-2xl font-bold text-foreground hover:opacity-60 transition-all"
                    >
                      Home
                    </Link>
                    <Link 
                      href="#me" 
                      onClick={(e) => { handleNavClick(e, '#me'); setIsMenuOpen(false); }}
                      className="text-2xl font-bold text-foreground hover:opacity-60 transition-all"
                    >
                      Me
                    </Link>
                    <Link 
                      href="#portfolio" 
                      onClick={(e) => { handleNavClick(e, '#portfolio'); setIsMenuOpen(false); }}
                      className="text-2xl font-bold text-foreground hover:opacity-60 transition-all"
                    >
                      Portfolio
                    </Link>
                    <Link 
                      href="#services" 
                      onClick={(e) => { handleNavClick(e, '#services'); setIsMenuOpen(false); }}
                      className="text-2xl font-bold text-foreground hover:opacity-60 transition-all"
                    >
                      Services
                    </Link>
                    <Link 
                      href="#video-showcase" 
                      onClick={(e) => { handleNavClick(e, '#video-showcase'); setIsMenuOpen(false); }}
                      className="text-2xl font-bold text-foreground hover:opacity-60 transition-all"
                    >
                      VFX Showreel
                    </Link>
                    <Link 
                      href="#contact" 
                      onClick={(e) => { handleNavClick(e, '#contact'); setIsMenuOpen(false); }}
                      className="text-2xl font-bold text-foreground hover:opacity-60 transition-all"
                    >
                      Get in touch
                    </Link>
                  </nav>
                </div>
              )}

              {/* Desktop Navigation Menu */}
              <nav 
                className="fixed top-4 md:top-8 right-4 md:right-8 lg:right-16 hidden lg:flex flex-col items-end gap-1 md:gap-4 z-[9999] transition-all duration-500 pointer-events-auto"
                style={{ opacity: navOpacity }}
              >
                <Link 
                  href="#home" 
                  onClick={(e) => handleNavClick(e, '#home')}
                  className={`text-lg md:text-2xl font-bold ${navTextColor} hover:opacity-60 transition-all relative group/link pointer-events-auto`}
                >
                  Home
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isDark ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}></span>
                </Link>
                <Link 
                  href="#me" 
                  onClick={(e) => handleNavClick(e, '#me')}
                  className={`text-lg md:text-2xl font-bold ${navTextColor} hover:opacity-60 transition-all relative group/link pointer-events-auto`}
                >
                  Me
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isDark ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}></span>
                </Link>
                <Link 
                  href="#portfolio" 
                  onClick={(e) => handleNavClick(e, '#portfolio')}
                  className={`text-lg md:text-2xl font-bold ${navTextColor} hover:opacity-60 transition-all relative group/link pointer-events-auto`}
                >
                  Portfolio
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isDark ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}></span>
                </Link>
                <Link 
                  href="#services" 
                  onClick={(e) => handleNavClick(e, '#services')}
                  className={`text-lg md:text-2xl font-bold ${navTextColor} hover:opacity-60 transition-all relative group/link pointer-events-auto`}
                >
                  Services
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isDark ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}></span>
                </Link>
                <Link 
                  href="#video-showcase" 
                  onClick={(e) => handleNavClick(e, '#video-showcase')}
                  className={`text-lg md:text-2xl font-bold ${navTextColor} hover:opacity-60 transition-all relative group/link pointer-events-auto`}
                >
                  VFX Showreel
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isDark ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}></span>
                </Link>
                <Link 
                  href="#contact" 
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className={`text-lg md:text-2xl font-bold ${navTextColor} hover:opacity-60 transition-all relative group/link pointer-events-auto`}
                >
                  Get in touch
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isDark ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}></span>
                </Link>
              </nav>

              <div 
                className="flex-1 flex flex-col justify-center transition-opacity duration-300 pt-24 md:pt-40 lg:pt-48"
                style={{ opacity: heroContentOpacity }}
              >
                <h1 
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-3 md:mb-6 cursor-pointer glitch-container group/name"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                  onMouseEnter={startHackEffect}
                  onMouseLeave={resetText}
                >
                  <span className="glitch-text" data-text={hackText}>{hackText}</span>
                </h1>
                
                <div className="space-y-1 md:space-y-2 mb-6 md:mb-12">
                  <p className="text-base md:text-xl text-muted-foreground">
                    Director & VFX Artist
                  </p>
                  <p className="text-sm md:text-lg text-muted-foreground font-semibold">
                    Innovator & Design Thinker
                  </p>
                  <p className="text-sm md:text-lg text-muted-foreground">
                    Building AI-powered healthcare solutions
                  </p>
                </div>

                <button
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className="space-y-3 md:space-y-4 group cursor-pointer text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <h2 className="text-xl md:text-3xl font-bold text-foreground transition-transform duration-300 group-hover:scale-110 origin-left">
                      Let's create
                    </h2>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-foreground md:w-6 md:h-6 transition-all duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
                    >
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                  <div className="h-1 w-20 md:w-32 bg-foreground transition-all duration-500 ease-out group-hover:w-32 md:group-hover:w-48"></div>
                </button>
              </div>
              
              <div id="me"></div>
              <div 
                className="relative mt-8 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 p-4 md:p-8 lg:p-16 lg:mt-0 transition-all duration-1000 ease-out"
                style={{
                  opacity: aboutMeProgress,
                  transform: `translateY(${(1 - aboutMeProgress) * 50}px)`,
                  pointerEvents: aboutMeProgress > 0.5 ? 'auto' : 'none',
                }}
              >
                <div className="space-y-2 md:space-y-6">
                  <h2 
                    className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    AASHISH THAKUR
                  </h2>
                  <p 
                    className="text-base sm:text-xl md:text-2xl font-bold text-foreground tracking-wide"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    DIRECTOR & VFX ARTIST
                  </p>
                  <p className="text-xs md:text-base lg:text-lg text-muted-foreground leading-relaxed">
                    Aashish Thakur is an aspiring innovator, developer, and design thinker passionate about building technology that solves real-world problems. Currently working on MediTrack+ and GlucoTrack+, focusing on AI-powered healthcare solutions, while also exploring web development, cloud technologies, and product design.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section 
        id="portfolio" 
        className="min-h-screen bg-background text-foreground py-12 md:py-16 lg:py-20 px-6 md:px-12 lg:px-16 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className="transition-all duration-700"
            style={{
              opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 600) / 200)),
              transform: isMobile ? 'none' : `translateY(${Math.max(0, 40 - (scrollY - 600) / 10)}px)`,
            }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-12 md:mb-16 lg:mb-20">
              Portfolio
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div 
                className="group overflow-hidden"
                style={{
                  opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 700) / 200)),
                  transform: isMobile ? 'none' : `translateY(${Math.max(0, 40 - (scrollY - 700) / 5)}px)`
                }}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <Image
                    src="/images/poster-1.jpg"
                    alt="GAYAK Movie Poster - Cinematic VFX Design"
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:grayscale"
                  />
                </div>
              </div>

              <div 
                className="group overflow-hidden"
                style={{
                  opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 750) / 200)),
                  transform: isMobile ? 'none' : `translateY(${Math.max(0, 40 - (scrollY - 750) / 5)}px)`
                }}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <Image
                    src="/images/poster-2.jpg"
                    alt="GAYAK Movie Poster - Visual Effects Showcase"
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:grayscale"
                  />
                </div>
              </div>

              <div 
                className="group overflow-hidden"
                style={{
                  opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 800) / 200)),
                  transform: isMobile ? 'none' : `translateY(${Math.max(0, 40 - (scrollY - 800) / 5)}px)`
                }}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <Image
                    src="/images/poster-3.jpg"
                    alt="GAYAK Movie Poster - Sunset Composition"
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:grayscale"
                  />
                </div>
              </div>

              <div 
                className="group overflow-hidden"
                style={{
                  opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 850) / 200)),
                  transform: isMobile ? 'none' : `translateY(${Math.max(0, 40 - (scrollY - 850) / 5)}px)`
                }}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <Image
                    src="/images/poster-4.jpg"
                    alt="GAYAK Movie Poster - Ensemble Cast"
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:grayscale"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section 
        id="video-showcase" 
        className="min-h-screen bg-black py-16 md:py-24 px-6 md:px-12 lg:px-16"
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className="transition-all duration-700"
            style={{
              opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 1800) / 300)),
              transform: isMobile ? 'none' : `translateY(${Math.max(0, 60 - (scrollY - 1800) / 10)}px)`,
            }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6">
              VFX Showreel
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-12 md:mb-16 max-w-2xl">
              A glimpse into my visual effects and title design work for film productions.
            </p>
          </div>
          
          <div 
            className="relative w-full max-w-5xl mx-auto"
            style={{
              opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 1900) / 300)),
              transform: isMobile ? 'none' : `scale(${Math.min(1, Math.max(0.9, 0.9 + (scrollY - 1900) / 3000))})`,
            }}
          >
            {/* Main Video Player */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-2xl shadow-black/50 group">
              <video
                key={activeVideo}
                src={videos[activeVideo].src}
                poster={videos[activeVideo].poster}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Navigation Arrows */}
              <button
                onClick={() => setActiveVideo((prev) => (prev === 0 ? videos.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Previous video"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <button
                onClick={() => setActiveVideo((prev) => (prev === videos.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Next video"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
            
            {/* Video Info */}
            <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{videos[activeVideo].title}</h3>
                <p className="text-gray-400">{videos[activeVideo].description}</p>
              </div>
              <div className="flex gap-3">
                {videos[activeVideo].tags.map((tag, index) => (
                  <span key={index} className="px-4 py-2 bg-white/10 text-white text-sm rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            
            {/* Video Thumbnails/Indicators */}
            {/* Desktop Thumbnails */}
            <div className="mt-8 hidden lg:flex gap-4 justify-center">
              {videos.map((video, index) => (
                <button
                  key={index}
                  onClick={() => setActiveVideo(index)}
                  className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                    activeVideo === index 
                      ? 'ring-2 ring-white scale-105' 
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="w-32 md:w-40 aspect-video bg-gray-800 relative">
                    <Image
                      src={video.poster || ''}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                  <p className="text-xs text-white mt-2 text-center truncate px-1">{video.title}</p>
                </button>
              ))}
            </div>

            {/* Mobile Project Selector Buttons */}
            <div className="mt-6 flex lg:hidden flex-wrap gap-3 justify-center">
              {videos.map((video, index) => {
                const shortTitle = video.title.split(' -')[0].replace(' Sequence', '');
                return (
                  <button
                    key={index}
                    onClick={() => setActiveVideo(index)}
                    className={`px-4 py-2 text-sm rounded-full border transition-all duration-300 active:scale-95 ${
                      activeVideo === index 
                        ? 'bg-white text-black border-white' 
                        : 'bg-black text-white border-white/20 hover:border-white/50 hover:bg-white/10'
                    }`}
                  >
                    {shortTitle}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="min-h-screen bg-background text-foreground px-6 md:px-12 lg:px-20 py-20 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto">
          <h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-16 md:mb-24 text-foreground text-center"
            style={{
              opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 2200) / 400)),
              transform: isMobile ? 'none' : `translateY(${Math.max(0, 40 - (scrollY - 2200) / 12)}px)`
            }}
          >
            Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            {/* Service 1 */}
            <div 
              className="space-y-4 group"
              style={{
                opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 2400) / 300)),
                transform: isMobile ? 'none' : `translateY(${Math.max(0, 50 - (scrollY - 2400) / 8)}px)`
              }}
            >
              <div className="text-5xl md:text-6xl font-bold text-gray-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                01
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                VFX & Video Editing
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Professional visual effects, compositing, color grading, and cinematic video editing for films, commercials, and digital content.
              </p>
            </div>

            {/* Service 2 */}
            <div 
              className="space-y-4 group"
              style={{
                opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 2500) / 300)),
                transform: isMobile ? 'none' : `translateY(${Math.max(0, 50 - (scrollY - 2500) / 8)}px)`
              }}
            >
              <div className="text-5xl md:text-6xl font-bold text-gray-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                02
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                UI/UX Design
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Creating intuitive and visually stunning user interfaces with a focus on user experience and modern design principles.
              </p>
            </div>

            {/* Service 3 */}
            <div 
              className="space-y-4 group"
              style={{
                opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 2600) / 300)),
                transform: isMobile ? 'none' : `translateY(${Math.max(0, 50 - (scrollY - 2600) / 8)}px)`
              }}
            >
              <div className="text-5xl md:text-6xl font-bold text-gray-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                03
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Web Development
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Full-stack web development using modern technologies, building scalable and performant web applications.
              </p>
            </div>

            {/* Service 4 */}
            <div 
              className="space-y-4 group"
              style={{
                opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 2700) / 300)),
                transform: isMobile ? 'none' : `translateY(${Math.max(0, 50 - (scrollY - 2700) / 8)}px)`
              }}
            >
              <div className="text-5xl md:text-6xl font-bold text-gray-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                04
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Brand Identity
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Developing distinctive visual identities through logo design, color systems, and cohesive brand assets.
              </p>
            </div>

            {/* Service 5 */}
            <div 
              className="space-y-4 group"
              style={{
                opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 2800) / 300)),
                transform: isMobile ? 'none' : `translateY(${Math.max(0, 50 - (scrollY - 2800) / 8)}px)`
              }}
            >
              <div className="text-5xl md:text-6xl font-bold text-gray-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                05
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Consulting
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Technology and creative consulting to help guide your digital transformation and creative projects.
              </p>
            </div>

            {/* Service 6 */}
            <div 
              className="space-y-4 group"
              style={{
                opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 2900) / 300)),
                transform: isMobile ? 'none' : `translateY(${Math.max(0, 50 - (scrollY - 2900) / 8)}px)`
              }}
            >
              <div className="text-5xl md:text-6xl font-bold text-gray-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                06
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Motion Graphics
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Dynamic motion graphics and animations for engaging visual storytelling and brand communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="min-h-screen bg-black text-white px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 md:mb-12"
            style={{
              opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 3200) / 400)),
              transform: isMobile ? 'none' : `translateY(${Math.max(0, 40 - (scrollY - 3200) / 12)}px)`
            }}
          >
            Start Your Project
          </h2>

          <p 
            className="text-lg md:text-xl text-gray-400 mb-12 md:mb-16 max-w-2xl"
            style={{
              opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 3300) / 300)),
              transform: isMobile ? 'none' : `translateY(${Math.max(0, 30 - (scrollY - 3300) / 10)}px)`
            }}
          >
            Let's collaborate and bring your ideas to life. Select your project details below.
          </p>

          {submitSuccess ? (
            <div 
              className="bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md p-8 md:p-16 text-center space-y-6 md:space-y-8 rounded-lg transition-all duration-500 scale-100 opacity-100"
              style={{
                opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 3400) / 300)),
                transform: isMobile ? 'none' : `translateY(${Math.max(0, 40 - (scrollY - 3400) / 10)}px)`
              }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white">Project Inquiry Received!</h3>
                <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-semibold">{formData.name}</span>. I have received your request for a <span className="text-white font-semibold">{formData.projectType || 'Creative'}</span> project with a budget of <span className="text-white font-semibold">{formData.budget || 'Custom'}</span>.
                </p>
                <p className="text-gray-500 text-sm">
                  I will get back to you at <span className="text-gray-300">{formData.email}</span> within 24 hours.
                </p>
              </div>
              
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-8 py-4 bg-white text-black hover:bg-zinc-200 font-bold transition-all duration-300 rounded-md shadow-lg cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit}
              className="space-y-10 md:space-y-12"
              style={{
                opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 3400) / 300)),
                transform: isMobile ? 'none' : `translateY(${Math.max(0, 40 - (scrollY - 3400) / 10)}px)`
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 group">
                  <label htmlFor="name" className="block text-sm uppercase tracking-wider text-gray-400 group-focus-within:text-white transition-colors">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-b-2 border-gray-700 focus:border-white py-3 text-lg md:text-xl outline-none transition-all duration-300 disabled:opacity-50"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-3 group">
                  <label htmlFor="email" className="block text-sm uppercase tracking-wider text-gray-400 group-focus-within:text-white transition-colors">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-b-2 border-gray-700 focus:border-white py-3 text-lg md:text-xl outline-none transition-all duration-300 disabled:opacity-50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Project Type Selection */}
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-wider text-gray-400">
                  Project Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {['VFX & Animation', 'UI/UX Design', 'Web Dev', 'Motion Graphics', 'Brand Identity', 'Other'].map((type) => {
                    const isSelected = formData.projectType === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => selectProjectType(type)}
                        disabled={isSubmitting}
                        aria-pressed={isSelected}
                        className={`py-3 md:py-4 px-4 border text-center font-semibold text-sm transition-all duration-300 cursor-pointer select-none rounded-md ${
                          isSelected
                            ? 'border-white bg-white text-black font-bold scale-[1.03] shadow-lg shadow-white/5'
                            : 'border-zinc-800 bg-zinc-950/50 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Budget Selection */}
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-wider text-gray-400">
                  Estimated Budget
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {['< $5k', '$5k - $15k', '$15k - $30k', '$30k+'].map((budget) => {
                    const isSelected = formData.budget === budget
                    return (
                      <button
                        key={budget}
                        type="button"
                        onClick={() => selectBudget(budget)}
                        disabled={isSubmitting}
                        aria-pressed={isSelected}
                        className={`py-3 md:py-4 px-3 border text-center font-semibold text-xs md:text-sm transition-all duration-300 cursor-pointer select-none rounded-md ${
                          isSelected
                            ? 'border-white bg-white text-black font-bold scale-[1.03] shadow-lg shadow-white/5'
                            : 'border-zinc-800 bg-zinc-950/50 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}
                      >
                        {budget}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3 group">
                <label htmlFor="message" className="block text-sm uppercase tracking-wider text-gray-400 group-focus-within:text-white transition-colors">
                  Message / Project Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b-2 border-gray-700 focus:border-white py-3 text-lg md:text-xl outline-none resize-none transition-all duration-300 disabled:opacity-50"
                  placeholder="Tell me about your project..."
                />
              </div>

              {/* Spam Honeypot Field */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="botcheck"
                  value={formData.botcheck}
                  onChange={handleInputChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-md text-sm flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative inline-flex items-center gap-4 text-xl md:text-2xl font-bold bg-white text-black px-10 py-5 hover:bg-gray-200 transition-all duration-300 overflow-hidden disabled:opacity-75 disabled:hover:bg-white rounded-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="relative z-10">Sending Inquiry...</span>
                      <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10 group-hover:text-black transition-colors duration-300">Send Proposal</span>
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="relative z-10 transition-transform duration-300 group-hover:translate-x-2 group-hover:stroke-black"
                      >
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div 
            className="mt-16 md:mt-20 pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            style={{
              opacity: isMobile ? 1 : Math.min(1, Math.max(0, (scrollY - 3600) / 300)),
            }}
          >
            <div className="space-y-2">
              <p className="text-gray-400 text-sm uppercase tracking-wider">Direct Contact</p>
              <Link 
                href="mailto:aashishthakurbusiness@gmail.com"
                className="text-xl md:text-2xl hover:text-gray-400 transition-colors"
              >
                aashishthakurbusiness@gmail.com
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm uppercase tracking-wider">Follow</p>
              <div className="flex gap-6">
                <Link 
                  href="https://github.com/aashishthakurbusiness-ship-it" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xl hover:text-gray-400 transition-colors"
                >
                  GitHub
                </Link>
                <Link 
                  href="https://www.linkedin.com/in/aashishthakurbusiness" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xl hover:text-gray-400 transition-colors"
                >
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
