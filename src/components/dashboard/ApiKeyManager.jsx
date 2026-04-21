import { useState, useCallback } from 'react'
import { useAuth } from '../../auth/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ENDPOINTS = [
  { method: 'POST', path: '/api/auth/generate-key', desc: 'API 키 발급 (인증 불필요)', auth: false, tag: 'auth' },
  { method: 'GET',  path: '/api/status',            desc: '시스템 상태 · 가동률',        auth: true,  tag: 'system' },
  { method: 'GET',  path: '/api/co2',               desc: 'CO₂ 포집 · 탄소 크레딧',      auth: true,  tag: 'data' },
  { method: 'GET',  path: '/api/algae',             desc: '미세조류 배양 데이터',          auth: true,  tag: 'data' },
  { method: 'GET',  path: '/api/revenue',           desc: '수익 · 재무 KPI',              auth: true,  tag: 'data' },
  { method: 'GET',  path: '/api/events',            desc: '시스템 이벤트 로그',            auth: true,  tag: 'data' },
  { method: 'GET',  path: '/api/all',               desc: '전체 지표 (단일 호출)',         auth: true,  tag: 'data' },
]

const MCP_TOOLS = [
  { name: 'get_status',  desc: '시스템 상태 · 가동률' },
  { name: 'get_co2',     desc: 'CO₂ 포집 · 탄소 크레딧' },
  { name: 'get_algae',   desc: '미세조류 배양 데이터' },
  { name: 'get_revenue', desc: '수익 · 재무 KPI' },
  { name: 'get_events',  desc: '시스템 이벤트 로그' },
  { name: 'get_all',     desc: '전체 지표 (단일 호출)' },
]

const TAG_COLOR = {
  auth:   { bg: 'rgba(234,179,8,0.12)',   text: '#854d0e' },
  system: { bg: 'rgba(21,128,61,0.10)',   text: '#15803d' },
  data:   { bg: 'rgba(2,132,199,0.10)',   text: '#0284c7' },
}

function CopyButton({ text, small }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      title="복사"
      className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
      style={{ background: copied ? 'rgba(21,128,61,0.12)' : 'rgba(5,46,22,0.06)', color: copied ? '#15803d' : 'rgba(5,46,22,0.50)' }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: small ? 14 : 16 }}>
        {copied ? 'check' : 'content_copy'}
      </span>
      {!small && <span className="text-xs font-medium">{copied ? '복사됨' : '복사'}</span>}
    </button>
  )
}

function TabBtn({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
      style={active
        ? { background: 'rgba(21,128,61,0.12)', color: '#15803d' }
        : { color: 'rgba(5,46,22,0.55)' }
      }
    >
      <span className="material-symbols-outlined text-base">{icon}</span>
      {label}
    </button>
  )
}

// ── 탭 1: API 키 발급 ──────────────────────────────────────────────
function ApiKeyTab({ user }) {
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleGenerate = async () => {
    if (!password) { setError('비밀번호를 입력해주세요.'); return }
    setLoading(true); setError(null)
    try {
      const res  = await fetch(`${API_URL}/api/auth/generate-key`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: user.email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.error || '키 발급 실패')
      setApiKey(data.apiKey)
      setPassword('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 서버 상태 배지 */}
      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(21,128,61,0.06)', border: '1px solid rgba(21,128,61,0.15)' }}>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-mono" style={{ color: 'rgba(5,46,22,0.70)' }}>FastAPI · {API_URL}</span>
        <a
          href={`${API_URL}/docs`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1 text-xs font-medium"
          style={{ color: '#15803d' }}
        >
          Swagger UI
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>

      {/* 키 발급 폼 */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(5,46,22,0.03)', border: '1px solid rgba(134,239,172,0.30)' }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">key</span>
          <p className="text-sm font-semibold" style={{ color: 'rgba(5,46,22,0.80)' }}>API 키 발급</p>
        </div>
        <p className="text-xs" style={{ color: 'rgba(5,46,22,0.55)' }}>
          계정 비밀번호 확인 후 새 키가 발급됩니다. 기존 키는 즉시 무효화됩니다.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            placeholder="계정 비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(134,239,172,0.50)',
              color: 'rgba(5,46,22,0.85)',
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'rgba(21,128,61,0.12)', color: '#15803d' }}
          >
            {loading ? '발급 중...' : '키 발급'}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">error</span>{error}
          </p>
        )}

        {apiKey && (
          <div className="space-y-2">
            <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: '#15803d' }}>
              <span className="material-symbols-outlined text-sm">check_circle</span>
              발급 완료 — 지금만 표시됩니다. 반드시 복사해 두세요.
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#ffffff', border: '1px solid rgba(21,128,61,0.30)' }}>
              <code className="flex-1 text-xs font-mono break-all" style={{ color: '#15803d' }}>{apiKey}</code>
              <CopyButton text={apiKey} small />
            </div>
          </div>
        )}
      </div>

      {/* curl 예시 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(5,46,22,0.45)' }}>REST API 사용 예시</p>
        <div className="relative p-3 rounded-xl font-mono text-xs overflow-x-auto" style={{ background: 'rgba(5,46,22,0.04)' }}>
          <pre style={{ color: 'rgba(5,46,22,0.75)', margin: 0 }}>{`curl ${API_URL}/api/all \\
  -H "X-API-Key: cova_live_<your-key>"`}</pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={`curl ${API_URL}/api/all \\\n  -H "X-API-Key: cova_live_<your-key>"`} small />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 탭 2: 엔드포인트 탐색기 ───────────────────────────────────────
function EndpointTab() {
  const [activeKey, setActiveKey] = useState(null)
  const [tryKey, setTryKey]       = useState('')
  const [responses, setResponses] = useState({})
  const [loading, setLoading]     = useState({})

  const tryEndpoint = useCallback(async (ep) => {
    setLoading(prev => ({ ...prev, [ep.path]: true }))
    try {
      const res = await fetch(`${API_URL}${ep.path}`, {
        headers: ep.auth ? { 'X-API-Key': tryKey } : {},
      })
      const data = await res.json()
      setResponses(prev => ({
        ...prev,
        [ep.path]: { ok: res.ok, status: res.status, data },
      }))
    } catch (e) {
      setResponses(prev => ({
        ...prev,
        [ep.path]: { ok: false, status: 0, data: { error: e.message } },
      }))
    } finally {
      setLoading(prev => ({ ...prev, [ep.path]: false }))
    }
  }, [tryKey])

  return (
    <div className="space-y-4">
      {/* API Key 입력 */}
      <div className="flex gap-2 items-center p-3 rounded-xl" style={{ background: 'rgba(5,46,22,0.04)', border: '1px solid rgba(134,239,172,0.30)' }}>
        <span className="material-symbols-outlined text-sm text-primary">key</span>
        <input
          type="text"
          placeholder="API 키를 입력하면 직접 테스트할 수 있습니다 (선택)"
          value={tryKey}
          onChange={e => setTryKey(e.target.value)}
          className="flex-1 bg-transparent text-xs focus:outline-none font-mono"
          style={{ color: 'rgba(5,46,22,0.75)' }}
        />
      </div>

      {/* 엔드포인트 목록 */}
      <div className="space-y-2">
        {ENDPOINTS.map(ep => {
          const resp  = responses[ep.path]
          const isLoading = loading[ep.path]
          const isOpen = activeKey === ep.path
          const tagStyle = TAG_COLOR[ep.tag]

          return (
            <div key={ep.path} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(134,239,172,0.28)' }}>
              {/* 헤더 */}
              <button
                onClick={() => setActiveKey(isOpen ? null : ep.path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ background: isOpen ? 'rgba(21,128,61,0.06)' : '#ffffff' }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-md font-mono"
                  style={{ background: ep.method === 'GET' ? 'rgba(2,132,199,0.12)' : 'rgba(234,179,8,0.15)', color: ep.method === 'GET' ? '#0284c7' : '#854d0e', minWidth: 40, textAlign: 'center' }}
                >
                  {ep.method}
                </span>
                <code className="text-sm font-mono flex-1" style={{ color: 'rgba(5,46,22,0.80)' }}>{ep.path}</code>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: tagStyle.bg, color: tagStyle.text }}
                >
                  {ep.tag}
                </span>
                <span className="material-symbols-outlined text-base" style={{ color: 'rgba(5,46,22,0.35)' }}>
                  {isOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* 상세 */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3" style={{ background: 'rgba(248,255,254,0.90)' }}>
                  <p className="text-xs pt-2" style={{ color: 'rgba(5,46,22,0.60)' }}>{ep.desc}</p>

                  {ep.auth && (
                    <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(5,46,22,0.45)' }}>
                      <span className="material-symbols-outlined text-sm text-primary">lock</span>
                      X-API-Key 헤더 필요
                    </p>
                  )}

                  <button
                    onClick={() => tryEndpoint(ep)}
                    disabled={isLoading || (ep.auth && !tryKey)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: (ep.auth && !tryKey) ? 'rgba(5,46,22,0.06)' : 'rgba(21,128,61,0.12)',
                      color:      (ep.auth && !tryKey) ? 'rgba(5,46,22,0.35)' : '#15803d',
                    }}
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    {isLoading ? '요청 중...' : (ep.auth && !tryKey) ? 'API 키 입력 후 테스트' : '실행 (Try it out)'}
                  </button>

                  {resp && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                          style={{ background: resp.ok ? 'rgba(21,128,61,0.12)' : 'rgba(239,68,68,0.12)', color: resp.ok ? '#15803d' : '#dc2626' }}
                        >
                          {resp.status || 'ERR'}
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(5,46,22,0.45)' }}>응답</span>
                        <CopyButton text={JSON.stringify(resp.data, null, 2)} small />
                      </div>
                      <pre
                        className="text-xs font-mono p-3 rounded-xl overflow-x-auto max-h-48"
                        style={{ background: 'rgba(5,46,22,0.04)', color: 'rgba(5,46,22,0.75)', margin: 0 }}
                      >
                        {JSON.stringify(resp.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <a
        href={`${API_URL}/docs`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-colors"
        style={{ background: 'rgba(2,132,199,0.10)', color: '#0284c7', border: '1px solid rgba(2,132,199,0.20)' }}
      >
        <span className="material-symbols-outlined text-base">open_in_new</span>
        FastAPI Swagger UI 열기 (전체 문서)
      </a>
    </div>
  )
}

// ── 탭 3: MCP 설치 ────────────────────────────────────────────────
function McpTab() {
  const projectPath = 'C:\\Users\\jsiv1\\Desktop\\GCS-Proj'

  const claudeDesktopConfig = JSON.stringify({
    mcpServers: {
      cova: {
        command: 'node',
        args: [`${projectPath}\\server\\mcp.js`],
        env: {},
      },
    },
  }, null, 2)

  const claudeCodeConfig = JSON.stringify({
    mcpServers: {
      cova: {
        command: 'node',
        args: ['server/mcp.js'],
      },
    },
  }, null, 2)

  const steps = [
    {
      title: 'Claude Desktop에 MCP 설치',
      icon: 'computer',
      configPath: '%APPDATA%\\Claude\\claude_desktop_config.json',
      config: claudeDesktopConfig,
      note: 'Claude Desktop을 완전히 종료 후 재시작해야 적용됩니다.',
    },
    {
      title: 'Claude Code에 MCP 설치',
      icon: 'code',
      configPath: '프로젝트 루트 .claude/settings.json의 mcpServers 섹션',
      config: claudeCodeConfig,
      note: '프로젝트 내 상대 경로를 사용합니다.',
    },
  ]

  return (
    <div className="space-y-6">
      {/* MCP 도구 목록 */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(5,46,22,0.03)', border: '1px solid rgba(134,239,172,0.30)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(5,46,22,0.45)' }}>제공 MCP 도구 ({MCP_TOOLS.length}개)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MCP_TOOLS.map(tool => (
            <div key={tool.name} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#ffffff', border: '1px solid rgba(134,239,172,0.30)' }}>
              <span className="material-symbols-outlined text-sm text-primary">build</span>
              <div>
                <p className="text-xs font-mono font-semibold" style={{ color: 'rgba(5,46,22,0.85)' }}>{tool.name}</p>
                <p className="text-xs" style={{ color: 'rgba(5,46,22,0.50)' }}>{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 설치 단계 */}
      {steps.map((step, i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{i + 1}</span>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: 'rgba(5,46,22,0.85)' }}>{step.title}</h3>
          </div>

          <div className="ml-8 space-y-2">
            <p className="text-xs" style={{ color: 'rgba(5,46,22,0.55)' }}>
              설정 파일 위치: <code className="font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(5,46,22,0.06)' }}>{step.configPath}</code>
            </p>
            <div className="relative">
              <pre
                className="text-xs font-mono p-4 rounded-xl overflow-x-auto"
                style={{ background: 'rgba(5,46,22,0.04)', color: 'rgba(5,46,22,0.80)', margin: 0 }}
              >
                {step.config}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={step.config} small />
              </div>
            </div>
            <p className="text-xs flex items-start gap-1.5" style={{ color: 'rgba(5,46,22,0.50)' }}>
              <span className="material-symbols-outlined text-sm mt-0.5" style={{ color: '#0284c7' }}>info</span>
              {step.note}
            </p>
          </div>
        </div>
      ))}

      {/* MCP 테스트 프롬프트 */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(2,132,199,0.06)', border: '1px solid rgba(2,132,199,0.20)' }}>
        <p className="text-xs font-semibold" style={{ color: '#0284c7' }}>연결 확인 — Claude에게 이렇게 물어보세요</p>
        {[
          '지금 Cova 시스템의 CO₂ 포집량은 얼마야?',
          '배양기 pH와 온도 상태 알려줘',
          '이번 달 수익 현황 요약해줘',
        ].map((prompt, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#ffffff' }}>
            <span className="material-symbols-outlined text-sm" style={{ color: '#0284c7' }}>chat</span>
            <p className="flex-1 text-xs" style={{ color: 'rgba(5,46,22,0.75)' }}>"{prompt}"</p>
            <CopyButton text={prompt} small />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function ApiKeyManager() {
  const { user }   = useAuth()
  const [tab, setTab] = useState('key')

  const tabs = [
    { id: 'key',      label: 'API 키',    icon: 'key' },
    { id: 'explorer', label: '엔드포인트', icon: 'api' },
    { id: 'mcp',      label: 'MCP 설치',  icon: 'extension' },
  ]

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div>
        <h2 className="text-xl font-bold text-on-surface mb-1">API / MCP 연동</h2>
        <p className="text-sm" style={{ color: 'rgba(5,46,22,0.55)' }}>
          FastAPI 백엔드 · MCP stdio 서버 · AI 모델 직접 연동
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(5,46,22,0.05)' }}>
        {tabs.map(t => (
          <TabBtn key={t.id} label={t.label} icon={t.icon} active={tab === t.id} onClick={() => setTab(t.id)} />
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="glass-panel rounded-2xl p-5 glow-shadow">
        {tab === 'key'      && <ApiKeyTab user={user} />}
        {tab === 'explorer' && <EndpointTab />}
        {tab === 'mcp'      && <McpTab />}
      </div>
    </div>
  )
}
