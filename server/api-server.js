/**
 * Cova REST API 서버 (인증 포함)
 *
 * 실행: node server/api-server.js
 * 기본 포트: 3001
 *
 * 인증:
 *   모든 /api/* 엔드포인트에 헤더 필요:
 *   X-API-Key: cova_live_<token>
 *
 *   키 발급:
 *   POST /api/auth/generate-key  { "email": "...", "password": "..." }
 *
 * 공개 엔드포인트:
 *   GET /          — 서버 정보 + 엔드포인트 목록
 */

import http from 'http'
import { USERS } from '../src/data/users.js'
import { requireApiKey, generateApiKey } from './middleware/auth.js'
import { readStatus, readCo2, readAlgae, readRevenue, readEvents, readAll } from './data/repository.js'

const PORT = process.env.API_PORT || 3001

// ── 헬퍼 ───────────────────────────────────────────────────────

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data, null, 2))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}) }
      catch { reject(new Error('Invalid JSON')) }
    })
    req.on('error', reject)
  })
}

// ── 보호된 라우트 ───────────────────────────────────────────────

const PROTECTED_ROUTES = {
  'GET /api/status':  readStatus,
  'GET /api/co2':     readCo2,
  'GET /api/algae':   readAlgae,
  'GET /api/revenue': readRevenue,
  'GET /api/events':  readEvents,
  'GET /api/all':     readAll,
}

// ── 서버 ───────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  const path = req.url.split('?')[0]
  const routeKey = `${req.method} ${path}`

  // 공개: 키 발급
  if (routeKey === 'POST /api/auth/generate-key') {
    let body
    try { body = await readBody(req) }
    catch { return json(res, 400, { error: 'Invalid JSON body' }) }

    const { email, password } = body
    if (!email || !password) return json(res, 400, { error: 'email and password are required' })

    const user = USERS.find(u => u.email === email && u.password === password)
    if (!user) return json(res, 401, { error: 'Invalid credentials' })

    const apiKey = generateApiKey({ userId: user.id, email: user.email, siteId: user.siteId })
    return json(res, 200, {
      apiKey,
      userId:    user.id,
      email:     user.email,
      siteId:    user.siteId,
      createdAt: new Date().toISOString(),
      note:      '이 키를 안전하게 보관하세요. 재발급 시 이전 키는 무효화됩니다.',
    })
  }

  // 공개: 인덱스
  if (path === '/' || path === '/api') {
    return json(res, 200, {
      name:        'Cova API Server',
      version:     '2.0.0',
      description: 'AI-readable structured data for Cova Container System dashboard',
      auth:        'X-API-Key 헤더 필수. 키 발급: POST /api/auth/generate-key',
      endpoints:   Object.keys(PROTECTED_ROUTES).map(k => k.replace('GET ', '')),
    })
  }

  // 보호된 라우트: API Key 검증
  const handler = PROTECTED_ROUTES[routeKey]
  if (!handler) return json(res, 404, { error: 'Not found' })

  const auth = requireApiKey(req)
  if (!auth.ok) return json(res, auth.status, { error: auth.error })

  return json(res, 200, handler())
})

server.listen(PORT, () => {
  process.stdout.write(`Cova API Server running at http://localhost:${PORT}\n`)
  process.stdout.write(`Endpoints: ${Object.keys(PROTECTED_ROUTES).join(', ')}\n`)
})
