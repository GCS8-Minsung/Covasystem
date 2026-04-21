export default function GlassCard({ children, className = '', onClick }) {
  return (
    <div
      className={`card rounded-xl ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
