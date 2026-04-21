import { useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AIInsightCard({ tab }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchInsight = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/ai/insight/${tab}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || '인사이트를 불러올 수 없습니다')
      }
      const data = await res.json()
      setInsight(data.insight)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [tab])

  return (
    <div
      className="rounded-2xl px-4 py-3.5 flex items-start gap-3"
      style={{
        background: 'linear-gradient(135deg, rgba(107,251,154,0.07) 0%, rgba(164,201,255,0.05) 100%)',
        border: '1px solid rgba(107,251,154,0.18)',
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: 'rgba(107,251,154,0.15)' }}
      >
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-primary tracking-wide">AI 인사이트</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(107,251,154,0.12)', color: '#6bfb9a' }}>
            COVA AI
          </span>
        </div>

        {!loading && !insight && !error && (
          <button
            onClick={fetchInsight}
            className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>play_circle</span>
            AI 분석 시작
          </button>
        )}

        {loading && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-on-surface-variant">분석 중...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">{error}</span>
            <button
              onClick={fetchInsight}
              className="text-xs text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              재시도
            </button>
          </div>
        )}

        {!loading && insight && (
          <p className="text-sm text-on-surface leading-relaxed">{insight}</p>
        )}
      </div>

      {!loading && insight && (
        <button
          onClick={fetchInsight}
          title="새로고침"
          className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-primary/10"
          style={{ color: 'rgba(107,251,154,0.6)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
        </button>
      )}
    </div>
  )
}
