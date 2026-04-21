import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../hooks/useLanguage'
import { useDemoData, REVENUE_BREAKDOWN } from './useDemoData'
import MetricCard from './MetricCard'
import SystemStatus from './SystemStatus'
import RevenueChart from './RevenueChart'
import Co2TrendChart from './Co2TrendChart'
import EventLog from './EventLog'
import CaptureDetail from './CaptureDetail'
import AlgaeDetail from './AlgaeDetail'
import RevenueDetail from './RevenueDetail'
import ApiKeyManager from './ApiKeyManager'
import AIInsightCard from './AIInsightCard'
import AIChatPanel from '../ui/AIChatPanel'
import Co2PredictChart from './Co2PredictChart'
import ReportGenerator from './ReportGenerator'

const NAV_ITEMS = [
  { key: 'overview', icon: 'dashboard' },
  { key: 'capture',  icon: 'air' },
  { key: 'algae',    icon: 'eco' },
  { key: 'revenue',  icon: 'bar_chart' },
  { key: 'report',   icon: 'description' },
  { key: 'api',      icon: 'api' },
]

function Overview({ data, t }) {
  return (
    <div className="space-y-5">
      <AIInsightCard tab="overview" />
      {/* Primary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon="air"               label={t.dashboard.todayCo2}   value={data.todayCo2.toFixed(1)}   unit="kg"      sub={`이달 ${data.monthCo2.toFixed(1)} kg`} accent="primary" />
        <MetricCard icon="bubble_chart"      label={t.dashboard.o2Purity}   value={data.o2Purity.toFixed(1)}   unit="%"       accent="sky" />
        <MetricCard icon="speed"             label={t.dashboard.uptime}     value={data.uptime.toFixed(1)}     unit="%"       accent="neutral" />
        <MetricCard icon="payments"          label={t.dashboard.caasLabel}  value="1,500"                      unit="만원/월"  sub="CaaS" accent="sky" />
      </div>
      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon="eco"               label={t.dashboard.biomassMonth} value={data.biomassMonth.toFixed(1)} unit="g"   accent="primary" />
        <MetricCard icon="token"             label={t.dashboard.credits}      value={data.credits.toFixed(4)}     unit="KAU" accent="neutral" />
        <MetricCard icon="device_thermostat" label={t.dashboard.cultureTemp}  value={data.cultureTemp.toFixed(1)} unit="°C"  accent="neutral" />
        <MetricCard icon="water_ph"          label={t.dashboard.culturePH}    value={data.culturePH.toFixed(2)}   unit="pH"  accent="sky" />
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Co2TrendChart trend={data.trend} />
        <RevenueChart breakdown={REVENUE_BREAKDOWN} />
      </div>
      {/* CO₂ 예측 */}
      <Co2PredictChart />
      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SystemStatus data={data} />
        <EventLog events={data.events} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const data = useDemoData()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'capture': return <CaptureDetail data={data} />
      case 'algae':   return <AlgaeDetail data={data} />
      case 'revenue': return <RevenueDetail data={data} />
      case 'report':  return <ReportGenerator />
      case 'api':     return <ApiKeyManager />
      default:        return <Overview data={data} t={t} />
    }
  }

  return (
    <div className="min-h-screen bg-surface flex overflow-hidden">
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-on-surface/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-60
        bg-surface-container border-r border-outline-variant/60
        flex flex-col p-5 gap-6 shrink-0 transition-transform duration-300
        shadow-md lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* 사이드바 로고 */}
        <Link to="/" className="flex items-center gap-2.5 group mt-1">
          <div className="w-7 h-7 rounded-lg primary-gradient-bg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-white text-xs font-black">C</span>
          </div>
          <span className="font-bold text-base tracking-widest text-on-surface">COVA</span>
        </Link>

        {/* 사이트 배지 */}
        <div className="px-3 py-2 rounded-xl bg-primary-container/60 border border-outline-variant/40">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary truncate">
              {user?.site?.split('—')[1]?.trim() ?? user?.site}
            </span>
          </div>
        </div>

        {/* 내비게이션 */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false) }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left ${
                activeTab === item.key
                  ? 'bg-primary-container text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined text-base ${activeTab === item.key ? 'text-primary' : ''}`}>
                {item.icon}
              </span>
              {t.dashboard[item.key]}
            </button>
          ))}
        </nav>

        {/* 하단 유저 정보 */}
        <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/40">
          {user?.isDemo && (
            <span className="badge-green text-center w-full">{t.dashboard.demoLabel}</span>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-sm">person</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-on-surface truncate">{user?.name}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            {t.nav.logout}
          </button>
        </div>
      </aside>

      {/* 메인 */}
      <main className="flex-1 min-w-0 flex flex-col overflow-auto bg-surface">
        {/* 헤더 — 대시보드 최상단 */}
        <header
          className="sticky top-0 z-10 px-5 lg:px-7 py-4 flex items-center gap-3"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
            borderBottom: '1px solid rgba(134,239,172,0.40)',
            boxShadow: '0 1px 0 rgba(5,46,22,0.05), 0 2px 8px rgba(5,46,22,0.04)',
          }}
        >
          {/* 모바일 햄버거 */}
          <button
            className="lg:hidden text-on-surface-variant hover:text-primary transition-colors shrink-0"
            onClick={() => setSidebarOpen(v => !v)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* 타이틀 블록 */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div
              className="hidden sm:flex w-8 h-8 rounded-xl items-center justify-center shrink-0"
              style={{ background: 'rgba(21,128,61,0.10)' }}
            >
              <span
                className="material-symbols-outlined text-base text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                monitoring
              </span>
            </div>
            <div className="min-w-0">
              <h1
                className="font-bold text-on-surface leading-tight truncate"
                style={{ fontSize: '0.9375rem', letterSpacing: '-0.015em' }}
              >
                {t.dashboard.title}
              </h1>
              <p
                className="text-xs truncate mt-0.5"
                style={{ color: 'rgba(5,46,22,0.50)', letterSpacing: '0' }}
              >
                {user?.site}
              </p>
            </div>
          </div>

          {/* 우측 액션 */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* 탭 표시 */}
            <span
              className="hidden md:block text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(5,46,22,0.06)', color: 'rgba(5,46,22,0.55)' }}
            >
              {t.dashboard[activeTab]}
            </span>

            {/* 라이브 인디케이터 */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(21,128,61,0.08)',
                border: '1px solid rgba(21,128,61,0.18)',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span
                className="text-xs font-semibold text-primary hidden sm:block"
                style={{ letterSpacing: '0.04em' }}
              >
                {t.dashboard.liveLabel}
              </span>
            </div>
          </div>
        </header>

        {/* 컨텐츠 */}
        <div className="flex-1 p-5 lg:p-7 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* AI 채팅 패널 */}
      <AIChatPanel />
    </div>
  )
}
