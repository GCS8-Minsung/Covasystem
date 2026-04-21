import { useLanguage } from '../../hooks/useLanguage'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-1 glass-panel rounded-full px-1 py-1">
      <button
        onClick={() => setLang('ko')}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
          lang === 'ko'
            ? 'bg-primary text-surface'
            : 'text-on-surface/60 hover:text-on-surface'
        }`}
      >
        KO
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
          lang === 'en'
            ? 'bg-primary text-surface'
            : 'text-on-surface/60 hover:text-on-surface'
        }`}
      >
        EN
      </button>
    </div>
  )
}
