import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const REPORT_TYPES = [
  {
    id: 'investor',
    icon: 'trending_up',
    label: '투자자용 보고서',
    desc: 'BEP·IRR·SROI 중심 투자 분석 + 환경 임팩트',
    color: '#6bfb9a',
  },
  {
    id: 'regulatory',
    icon: 'gavel',
    label: '규제 대응 보고서',
    desc: 'K-ETS·CBAM 준수 현황 + 탄소 크레딧 실적',
    color: '#a4c9ff',
  },
]

function MarkdownBlock({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5 text-sm text-on-surface leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('# '))
          return <h1 key={i} className="text-lg font-bold text-on-surface mt-4 mb-1">{line.slice(2)}</h1>
        if (line.startsWith('## '))
          return <h2 key={i} className="text-base font-semibold text-primary mt-3 mb-1">{line.slice(3)}</h2>
        if (line.startsWith('### '))
          return <h3 key={i} className="text-sm font-semibold text-on-surface/80 mt-2">{line.slice(4)}</h3>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-on-surface/80">{line.slice(2)}</li>
        if (line.startsWith('**') && line.endsWith('**'))
          return <p key={i} className="font-semibold text-on-surface">{line.slice(2, -2)}</p>
        if (line.trim() === '')
          return <div key={i} className="h-1" />
        return <p key={i} className="text-on-surface/80">{line}</p>
      })}
    </div>
  )
}

export default function ReportGenerator() {
  const [selectedType, setSelectedType] = useState('investor')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedAt, setGeneratedAt] = useState(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const res = await fetch(`${API_URL}/api/ai/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: selectedType, language: 'ko' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || '보고서 생성 실패')
      }
      const data = await res.json()
      setReport(data.report)
      setGeneratedAt(new Date().toLocaleString('ko-KR'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!report) return
    const typeLabel = REPORT_TYPES.find(t => t.id === selectedType)?.label ?? '보고서'
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Cova ESG ${typeLabel}</title>
<style>
  body{font-family:-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1a1a1a;line-height:1.7}
  h1{color:#15803d;border-bottom:2px solid #15803d;padding-bottom:8px}
  h2{color:#15803d;margin-top:28px}
  h3{color:#374151;margin-top:20px}
  li{margin:4px 0}
  .meta{color:#6b7280;font-size:0.85em;margin-bottom:24px}
</style>
</head>
<body>
<div class="meta">Cova Container System · 생성일: ${generatedAt} · AI 자동 생성 (GPT-5 Mini)</div>
${report.split('\n').map(l => {
  if (l.startsWith('# ')) return `<h1>${l.slice(2)}</h1>`
  if (l.startsWith('## ')) return `<h2>${l.slice(3)}</h2>`
  if (l.startsWith('### ')) return `<h3>${l.slice(4)}</h3>`
  if (l.startsWith('- ') || l.startsWith('* ')) return `<li>${l.slice(2)}</li>`
  if (l.trim() === '') return '<br>'
  return `<p>${l}</p>`
}).join('\n')}
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Cova_ESG_${typeLabel}_${new Date().toISOString().slice(0,10)}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface mb-1">AI ESG 보고서 생성</h2>
        <p className="text-sm text-on-surface/40">현재 시스템 데이터 기반으로 GPT-5 Mini가 보고서를 자동 작성합니다</p>
      </div>

      {/* 보고서 유형 선택 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REPORT_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className="rounded-2xl p-4 text-left transition-all duration-150"
            style={{
              background: selectedType === type.id
                ? `linear-gradient(135deg, ${type.color}15 0%, ${type.color}08 100%)`
                : 'rgba(53,53,53,0.4)',
              border: selectedType === type.id
                ? `1.5px solid ${type.color}40`
                : '1.5px solid rgba(61,74,62,0.2)',
              boxShadow: selectedType === type.id ? `0 0 0 1px ${type.color}20` : 'none',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="material-symbols-outlined text-base"
                style={{ color: type.color, fontVariationSettings: "'FILL' 1" }}
              >
                {type.icon}
              </span>
              <span className="text-sm font-semibold text-on-surface">{type.label}</span>
              {selectedType === type.id && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: `${type.color}20`, color: type.color }}>
                  선택됨
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface/50">{type.desc}</p>
          </button>
        ))}
      </div>

      {/* 생성 버튼 */}
      <button
        onClick={generate}
        disabled={loading}
        className="w-full py-3 rounded-2xl font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2"
        style={{
          background: loading ? 'rgba(107,251,154,0.15)' : 'linear-gradient(135deg,#6bfb9a,#15803d)',
          color: loading ? '#6bfb9a' : '#052e16',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(107,251,154,0.25)',
        }}
      >
        {loading ? (
          <>
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
            보고서 생성 중... (15~30초 소요)
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            AI 보고서 생성하기
          </>
        )}
      </button>

      {/* 에러 */}
      {error && (
        <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#fca5a5' }}>
          ⚠️ {error}
        </div>
      )}

      {/* 생성된 보고서 */}
      {report && (
        <div className="glass-panel rounded-2xl p-5 glow-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              <span className="text-sm font-semibold text-on-surface">생성된 보고서</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(107,251,154,0.12)', color: '#6bfb9a' }}>
                GPT-5 Mini
              </span>
            </div>
            <button
              onClick={downloadReport}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-colors"
              style={{ background: 'rgba(107,251,154,0.12)', color: '#6bfb9a', border: '1px solid rgba(107,251,154,0.20)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
              HTML 다운로드
            </button>
          </div>
          <p className="text-xs text-on-surface/30">생성 시각: {generatedAt} · 실시간 데이터 반영</p>
          <div className="border-t border-outline-variant/20 pt-4 max-h-[480px] overflow-y-auto">
            <MarkdownBlock text={report} />
          </div>
        </div>
      )}
    </div>
  )
}
