import { createContext, useContext, useState, useMemo } from 'react'
import ko from '../i18n/ko'
import en from '../i18n/en'

const translations = { ko, en }

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ko')
  const t = translations[lang]
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
