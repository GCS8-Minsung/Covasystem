import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const progressRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      if (progressRef.current) {
        progressRef.current.style.width = `${pct}%`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2.5px] bg-transparent">
      <div
        ref={progressRef}
        className="h-full transition-[width] duration-75 w-0"
        style={{ background: 'linear-gradient(90deg, #1a7a3c, #2b8ac5, #4ade80)' }}
      />
    </div>
  )
}
