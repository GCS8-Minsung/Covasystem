/**
 * Cova MCP 서버 (Model Context Protocol)
 *
 * 실행 방법:
 *   stdio (Claude Desktop / Claude Code):
 *     node server/mcp.js
 *
 *   HTTP/SSE (클라우드 배포 시 — 추후 확장):
 *     MCP_TRANSPORT=sse MCP_PORT=3002 node server/mcp.js
 *
 * 의존성: @modelcontextprotocol/sdk
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { readStatus, readCo2, readAlgae, readRevenue, readEvents, readAll } from './data/repository.js'

// ── 도구 정의 ──────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'get_status',
    description: 'Cova 컨테이너 시스템의 전체 상태와 가동률을 반환합니다.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_co2',
    description: 'CO₂ 포집 현황 (오늘/월간 포집량, 포집 효율, 탄소 크레딧)을 반환합니다.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_algae',
    description: '미세조류 배양 데이터 (O₂ 순도, 바이오매스 생산량, pH, 조도, 파생 제품)를 반환합니다.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_revenue',
    description: '수익 현황 (CaaS 구독료, 탄소 시장 가격, 재무 KPI: BEP·IRR·NPV·SROI)을 반환합니다.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_events',
    description: '최근 시스템 이벤트 로그 (포집기 세척, pH 보정, 알람 등)를 반환합니다.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_all',
    description: '모든 대시보드 지표를 단일 호출로 반환합니다. 전체 현황 파악에 사용하세요.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
]

// ── MCP 서버 초기화 ────────────────────────────────────────────

const server = new Server(
  { name: 'cova-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name } = req.params

  const handlers = {
    get_status:  readStatus,
    get_co2:     readCo2,
    get_algae:   readAlgae,
    get_revenue: readRevenue,
    get_events:  readEvents,
    get_all:     readAll,
  }

  const handler = handlers[name]
  if (!handler) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
      isError: true,
    }
  }

  const data = handler()
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  }
})

// ── 전송 계층 선택 ─────────────────────────────────────────────
// 현재: stdio (Claude Desktop/Code)
// 추후 클라우드: MCP_TRANSPORT=sse 환경변수로 전환

async function main() {
  const transport = process.env.MCP_TRANSPORT === 'sse'
    ? await startSseTransport()
    : new StdioServerTransport()

  await server.connect(transport)

  if (process.env.MCP_TRANSPORT !== 'sse') {
    process.stderr.write('Cova MCP Server running (stdio)\n')
  }
}

async function startSseTransport() {
  // SSE transport 구현체는 클라우드 배포 시 추가
  // 예: import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
  throw new Error('SSE transport not yet implemented. Set MCP_TRANSPORT=stdio or omit.')
}

main().catch((err) => {
  process.stderr.write(`MCP Server error: ${err.message}\n`)
  process.exit(1)
})
