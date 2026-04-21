/**
 * API Key 인증 미들웨어
 *
 * 인메모리 키 스토어 (데모용)
 * 실제 운영 시: Map → DB 테이블로 교체 (users.apiKeys 컬럼 또는 별도 테이블)
 */

import { randomBytes } from 'crypto'

// { apiKey: { userId, email, siteId, createdAt } }
const keyStore = new Map()

export function generateApiKey({ userId, email, siteId }) {
  const raw = randomBytes(24).toString('hex')
  const apiKey = `cova_live_${raw}`
  keyStore.set(apiKey, { userId, email, siteId, createdAt: new Date().toISOString() })
  return apiKey
}

export function revokeApiKey(apiKey) {
  return keyStore.delete(apiKey)
}

export function lookupApiKey(apiKey) {
  return keyStore.get(apiKey) ?? null
}

/**
 * HTTP 요청에서 API Key를 추출하고 검증합니다.
 * 헤더: X-API-Key: cova_live_...
 * 유효하면 req.caller 에 키 메타데이터를 주입합니다.
 *
 * @returns {{ ok: boolean, status?: number, error?: string, caller?: object }}
 */
export function requireApiKey(req) {
  const apiKey = req.headers['x-api-key']
  if (!apiKey) return { ok: false, status: 401, error: 'Missing X-API-Key header' }

  const caller = lookupApiKey(apiKey)
  if (!caller) return { ok: false, status: 403, error: 'Invalid or revoked API key' }

  return { ok: true, caller }
}
