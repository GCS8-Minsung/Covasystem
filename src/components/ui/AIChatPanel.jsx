import { useState, useRef, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const QUICK_QUESTIONS = [
  '오늘 CO₂ 포집량은?',
  'BEP 달성 전략은?',
  '조류 배양 상태 분석해줘',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
        style={isUser
          ? { background: 'rgba(21,128,61,0.15)', color: '#15803d' }
          : { background: 'rgba(107,251,154,0.15)', color: '#6bfb9a' }
        }
      >
        {isUser
          ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
          : <span className="material-symbols-outlined" style={{ fontSize: 14 }}>smart_toy</span>
        }
      </div>
      <div
        className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
        style={isUser
          ? { background: 'rgba(107,251,154,0.82)', color: '#052e16', borderRadius: '18px 4px 18px 18px' }
          : { background: 'rgba(53,53,53,0.6)', color: '#e5e2e1', borderRadius: '4px 18px 18px 18px', border: '1px solid rgba(107,251,154,0.15)' }
        }
      >
        {msg.content}
      </div>
    </div>
  )
}

export default function AIChatPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! Cova AI 어드바이저입니다. 탄소 포집, 미세조류 배양, 수익 분석에 대해 무엇이든 물어보세요.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setError(null)

    const userMsg = { role: 'user', content: msg }
    const history = messages.filter(m => m.role !== 'error')
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: history.slice(-6),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || '오류가 발생했습니다')
      }
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setError(e.message)
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(v => !v)}
        title="AI 어드바이저"
        className="fixed bottom-6 right-6 z-50 w-13 h-13 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          width: 52, height: 52,
          background: open ? 'rgba(21,128,61,0.9)' : 'linear-gradient(135deg,#6bfb9a,#15803d)',
          boxShadow: '0 4px 20px rgba(107,251,154,0.35)',
        }}
      >
        <span className="material-symbols-outlined text-white" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>
          {open ? 'close' : 'smart_toy'}
        </span>
      </button>

      {/* 채팅 패널 */}
      <div
        className="fixed bottom-20 right-6 z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-300 origin-bottom-right"
        style={{
          width: 340,
          height: open ? 480 : 0,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          background: 'rgba(19,19,19,0.97)',
          border: '1px solid rgba(107,251,154,0.20)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(107,251,154,0.08)',
        }}
      >
        {/* 헤더 */}
        <div
          className="px-4 py-3 flex items-center gap-2.5 shrink-0"
          style={{ borderBottom: '1px solid rgba(107,251,154,0.12)', background: 'rgba(107,251,154,0.06)' }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(107,251,154,0.15)' }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none" style={{ color: '#e5e2e1' }}>Cova AI 어드바이저</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#6bfb9a' }}>● 온라인</p>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 scrollbar-thin">
          {messages.map((m, i) => <Message key={i} msg={m} />)}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'rgba(107,251,154,0.15)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#6bfb9a' }}>smart_toy</span>
              </div>
              <div className="px-3.5 py-3 rounded-2xl flex gap-1 items-center" style={{ background: 'rgba(53,53,53,0.6)', border: '1px solid rgba(107,251,154,0.15)' }}>
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 빠른 질문 */}
        {messages.length <= 1 && (
          <div className="px-3.5 pb-2 flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs px-2.5 py-1.5 rounded-full transition-colors"
                style={{ background: 'rgba(107,251,154,0.10)', color: '#6bfb9a', border: '1px solid rgba(107,251,154,0.20)' }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* 입력창 */}
        <div
          className="px-3 py-2.5 flex gap-2 items-end shrink-0"
          style={{ borderTop: '1px solid rgba(107,251,154,0.12)' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 text-sm rounded-xl px-3 py-2 outline-none resize-none bg-transparent"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#e5e2e1', border: '1px solid rgba(107,251,154,0.15)' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0"
            style={{
              background: input.trim() && !loading ? 'linear-gradient(135deg,#6bfb9a,#15803d)' : 'rgba(255,255,255,0.06)',
              color: input.trim() && !loading ? '#052e16' : 'rgba(255,255,255,0.3)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </div>
    </>
  )
}
