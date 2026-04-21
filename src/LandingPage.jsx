import Navbar from './components/layout/Navbar'
import ScrollProgress from './components/layout/ScrollProgress'
import HeroSection from './components/sections/HeroSection'
import CaptureSection from './components/sections/CaptureSection'
import AlgaeSection from './components/sections/AlgaeSection'
import AlgaeHUDSection from './components/sections/AlgaeHUDSection'
import GameSection from './components/sections/GameSection'

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <HeroSection id="hero" />
        <CaptureSection id="capture" />
        <AlgaeSection id="algae" />
        <AlgaeHUDSection id="hud" />
        <GameSection id="game" />
      </main>
      <footer id="contact" className="py-16 px-6 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-lg tracking-widest text-on-surface">COVA</span>
          <span className="text-sm text-on-surface/30">© 2026 Cova. All rights reserved.</span>
        </div>
      </footer>
    </>
  )
}
